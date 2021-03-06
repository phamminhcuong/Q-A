var addSessionBtn = document.getElementById("add-session-btn");                      // nut them session
var addSessionBox = document.getElementById("add-session-box");                      // Hop thoai them session
var closeModalAddSessionBtn = document.getElementById("close-modal-add-session");    // nut dong hop thoai them session
var cancelAddSessionBtn = document.getElementById("cancel-add-session-btn");         // nut huy them sesison
var confirmAddBtn = document.getElementById("confirm-add-btn");                      // nut xac nhan them sesison

var sesssionName = document.getElementById("session-name");                          // hop text ten sesison
var beginTime = document.getElementById("begin-time");                               // thoi gian bat dau
var endTime = document.getElementById("end-time");                                   // thoi gian ket thuc

var sessionList = document.getElementById("list");                                   // danh sach cac session hien co

let socket = io();

// lấy dữ liệu từ server
axios.get('/api/session/')
    .then(sessions => sessions.data)
    .then(sessions => {
        // eventList.removeChild(bigLoader);
        const hasExpiredSession = sessions.some(session => new Date(session.endDate) < new Date() && session.isClosed === false);
        let confirmed = false;
        if (hasExpiredSession) {
            confirmed = window.confirm('Bạn có muốn đóng toàn bộ phiên quá hạn?');
        }
        sessions.forEach(session => {
            if (new Date(session.endDate) < new Date() && !session.isClosed && confirmed) {
                axios.put(`/api/session/${session._id}`, {isClosed: true});
                session.isClosed = true;
            }
            adminAddSession(session)
        })
    })
    .catch(error => {
        console.log(error)
    });


//hộp dropdown
function dropclick() {
    var click = document.getElementById("dropContent");
    if (click.className.indexOf("w3-show") === -1) {
        click.className += " w3-show";
    } else {
        click.className = click.className.replace(" w3-show", "");
    }
}

// chuyen gia tri thang tu dang so sang dang chu
function parseMonth(value) {
    var res = "";

    switch (value) {
        case 1:
            res = "Feb";
            break;
        case 2:
            res = "Mar";
            break;
        case 3:
            res = "Apr";
            break;
        case 4:
            res = "May";
            break;
        case 5:
            res = "Jun";
            break;
        case 6:
            res = "Jul";
            break;
        case 7:
            res = "Aug";
            break;
        case 8:
            res = "Sep";
            break;
        case 9:
            res = "Oct";
            break;
        case 10:
            res = "Nov";
            break;
        case 11:
            res = "Dec";
            break;
        default:
            res = "Jan";
    }

    return res;
}

// chon buoi (am hay pm)
function setPeriod(h) {
    return (h < 12) ? "am" : "pm";
}

// chuyen gia tri gio ve dang nho hon 12
function parseHour(h) {
    return h % 12;
}

// reset gia tri trong hop thoai them session
function reset() {
    sesssionName.value = "";
    beginTime.value = "";
    endTime.value = "";
}

function parseMinutes(m) {
    return (m < 10) ? ("0" + m) : m;
}

// ----------------------------------------- DANH SACH CAC HAM TINH NANG CUA TRANG WEB ------------------------------

// mo hop thoai them session
// addSessionBtn.onclick = function() {
// 	addSessionBox.style.display = "block";
// }

//dong hop thoai them sessison
closeModalAddSessionBtn.onclick = function () {
    reset();
    addSessionBox.style.display = "none";
}

// an chuot bat ky ngoai hop thoai them session thi tu dong dong hop thoai
window.onclick = function (event) {
    if (event.target == addSessionBox) {
        reset();
        addSessionBox.style.display = "none";
    }
}

// huy them session
cancelAddSessionBtn.onclick = function () {
    reset();
    addSessionBox.style.display = "none";
};

// them session
function adminAddSession(session) {

    let beginTime = new Date(session.beginDate),
        endTime = new Date(session.endDate);

    //Tao Session moi
    var newSession = document.createElement("div");
    newSession.id = session._id;
    newSession.classList.add("w3-bar", "w3-hover-light-gray", 'w3-margin', 'session');
    //Them session vao van ban
    sessionList.appendChild(newSession);

    newSession.innerHTML = "<div class=\"w3-bar-item\">" +
        `	<label class=\"w3-small w3-text-gray\" style=\"display: block;\">${beginTime.toLocaleDateString()} ${beginTime.toLocaleTimeString()} - ${endTime.toLocaleDateString()} ${endTime.toLocaleTimeString()}</label>` +
        `	<label style=\"display: block;\">${session.eventName}</label>` +
        "</div>" +
        "<div class=\"tooltip w3-bar-item w3-right w3-padding-small\" >" +
            "<button class=\"w3-button session-option end-session\" onclick=\"endSession(this)\">" +
            "	<i class=\"fas fa-times\" style=\"display: block;\"></i>" +
            "</button>" +
        "	<label class='tooltiptext' style=\"display: block; cursor: pointer;\">Kết thúc</label>" +
        "</div>" +
        "<div class=\"tooltip w3-bar-item w3-right w3-padding-small\" >" +
            "<button class=\"w3-button session-option close-session\" onclick=\"closeSession(this)\">" +
            "<i class=\"fas fa-minus\" style=\"display: block;\"></i>" +
            "</button>" +
            "<label class='tooltiptext' style=\"display: block; cursor: pointer;\">Đóng Phiên</label>" +
        "</div>";

    // reset lai hop thoai them session
    reset();

    // dong hop thoai them session
    addSessionBox.style.display = "none";

    // hien thi session dua tren du lieu
    if (session.isClosed) {
        let obj = newSession.querySelector('.fa-minus').parentElement;
        closeSessionDOM(obj);
    }
}

function endSession(obj) {
    var confirmed = window.confirm("Bạn có chắc muốn kết thúc phiên hỏi đáp này?");
    if (confirmed) {
        let sessionID = obj.parentElement.parentElement.id;
        axios.delete(`/api/session/${sessionID}`)
            .then(() => {
                socket.emit('deleteSession', sessionID);
            })
            .catch(error => {
                console.log(error);
            })
    }
}

async function closeSession(obj) {
    let parentContainData = obj.parentElement.parentElement;
    const updatedSession = await axios.put(`/api/session/${parentContainData.id}`, {isClosed: true});
    socket.emit('updateSession', updatedSession.data);
}

function closeSessionDOM(obj) {
    obj.parentElement.parentElement.children[0].classList.add('fade');
    obj.setAttribute("onclick", "activeSession(this)");
    var child = obj.children;
    child[0].setAttribute("class", "fas fa-check");
    obj.nextElementSibling.innerHTML = "Mở phiên";
}

async function activeSession(obj) {
    let parentContainData = obj.parentElement.parentElement;
    const updatedSession = await axios.put(`/api/session/${parentContainData.id}`, {isClosed: false});
    socket.emit('updateSession', updatedSession.data);
}

function activateSessionDOM(obj) {
    obj.parentElement.parentElement.children[0].classList.remove('fade');
    obj.setAttribute("onclick", "closeSession(this)");
    var child = obj.children;
    child[0].setAttribute("class", "fas fa-minus");
    obj.nextElementSibling.innerHTML = "Đóng";
}

// kênh thêm phiên hỏi đáp
socket.on('addSession', session => {
    adminAddSession(session);
});

// kênh cập nhật phiên hỏi đáp
socket.on('updateSession', session => {
    let updatedElement = document.getElementById(session._id);
    let obj = updatedElement.querySelectorAll('.fas')[1].parentElement;
    if (session.isClosed) {
        closeSessionDOM(obj);
    } else {
        activateSessionDOM(obj);
    }
});

// kênh xóa phiên hỏi đáp
socket.on('deleteSession', sessionID => {
    let deletedSession = document.getElementById(sessionID);
    deletedSession.remove();
});