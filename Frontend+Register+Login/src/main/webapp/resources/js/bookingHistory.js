let doctors = []
// function to run onload
document.addEventListener('DOMContentLoaded', function () {
    let state = sessionStorage.getItem("state") //IMPORTANT: Set state to develop code
    getBookings();
})

// This is function to delete a booking
function cancelBooking(id) {
    if (confirm("Are you sure you want to cancel this appointment?\n *Note: You can rebook a new one")) {
        fetch(`http://localhost:8080/bookings/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            alert("Booking successfully canceled.")
        }).then(res => {
            location.reload()
        })
    }
}

// This is get booking function
function getBookings() {
    let state = sessionStorage.getItem("state")
    let pastBookings = document.getElementById("pastBookings")
    let upcomingBookings = document.getElementById("upcomingBookings")
    let today = new Date()
    fetch(`http://localhost:8080/doctors`).then(res => res.json()) // This is fetching doctors
        .then(json => {
            json.sort((a, b) => {
                (parseInt(a.id) > parseInt(b.id)) ? 1 : -1
            })
            for (let i = 0; i < json.length; i++) {
                let obj = {id: json[i].id, name: json[i].name}
                doctors.push(obj)
            }
            // This is fetching bookings from the user
        }).then(fetch('http://localhost:8080/bookings/' + state).then(res => res.json())
        .then(json => {
            // This sort the JSON by date, from most recently
            json.sort((a, b) => {
                if (new Date(parseInt(a.date.split("-")[0]),
                    parseInt(a.date.split("-")[1]) - 1,
                    parseInt(a.date.split("-")[2]),
                    parseInt(a.time.split(":")[0]),
                    parseInt(a.time.split(":")[1])) >
                    new Date(parseInt(b.date.split("-")[0]),
                        parseInt(b.date.split("-")[1]) - 1,
                        parseInt(b.date.split("-")[2]),
                        parseInt(b.time.split(":")[0]),
                        parseInt(b.time.split(":")[1])))
                    return -1
                else return 1
            })

            for (let i = 0; i < json.length; i++) {
                // if the bookings made later than the current time, move them to past bookings table
                if (today > new Date(parseInt(json[i].date.split("-")[0]),
                    parseInt(json[i].date.split("-")[1]) - 1,
                    parseInt(json[i].date.split("-")[2]),
                    parseInt(json[i].time.split(":")[0]),
                    parseInt(json[i].time.split(":")[1]))) {
                    let doctorName = ""
                    doctors.forEach(doc => {
                        if (doc.id === json[i].doctor_id) doctorName = doc.name
                    })
                    pastBookings.innerHTML += '<tr id="pb">' +
                        '<td>' + json[i].id + '</td>' +
                        '<td>' + doctorName + '</td>' +
                        '<td>' + json[i].time + '</td>' +
                        '<td>' + json[i].date + '</td>' + '</tr>'
                } else {
                    // if not, the bookings will be put in upcoming table
                    let id = json[i].id
                    let cancel = `<div id="delete" onclick='cancelBooking(${id})'>Cancel</div>`
                    let doctorName = ""
                    doctors.forEach(doc => {
                        if (doc.id === json[i].doctor_id) doctorName = doc.name
                    })
                    upcomingBookings.innerHTML += '<tr id="bookings">' +
                        '<td>' + json[i].id + '</td>' +
                        '<td>' + doctorName + '</td>' +
                        '<td>' + json[i].time + '</td>' +
                        '<td>' + json[i].date + '</td>' +
                        '<td>' + cancel + '</td>' +
                        '</tr>'
                }
            }
        }))

}