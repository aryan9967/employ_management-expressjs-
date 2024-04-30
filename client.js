let username = ""
const update_form = document.getElementById("update_form")
const update_form_container = document.getElementById("update_form_container")
const add_button = document.getElementById("add_record")
const create_form_container = document.getElementById("create_form_container")
const create_form = document.getElementById("create_form")

document.getElementById("close_btn").addEventListener('click', () => {
    update_form_container.style.display = "none"
})
document.getElementById("close_btn2").addEventListener('click', () => {
    create_form_container.style.display = "none"
})
document.getElementById("close_btn3").addEventListener('click', () => {
    document.getElementById("table_details").style.display = "none"
})
add_button.addEventListener('click', () => {
    create_form_container.style.display = "block"
})

create_form.addEventListener('submit', async (e) => {
    e.preventDefault()
    var formdata = new FormData(create_form)
    output = ""
    for (const [key, value] of formdata) {
        output += `${key}: ${value}\n`;
    }
    console.log(output)
    var options = {
        method: 'POST',
        body: formdata
    }
    try {
        var res = await fetch("http://localhost:5000/add_employee", options)
        var res_json = await res.json()
        console.log("response after add_employee", res_json)
        display_table(username)
        create_form_container.style.display = "none"
    }
    catch (err) {
        console.log(err)
    }
})

function change_data(elem, username) {
    // console.log(username)
    update_form_container.style.display = "block"
    td = elem.parentNode
    tr = td.parentNode
    // console.log(tr)
    data_container = tr.getElementsByTagName("td")
    // console.log(data_container)
    document.getElementById("first_name").value = data_container[1].innerText
    document.getElementById("last_name").value = data_container[2].innerText
    document.getElementById("middle_name").value = data_container[3].innerText
    document.getElementById("email").value = data_container[4].innerText
    document.getElementById("contact").value = data_container[5].innerText
    document.getElementById("address").value = data_container[6].innerText
    document.getElementById("city").value = data_container[7].innerText
    document.getElementById("dob").value = data_container[8].innerText

    update_form.addEventListener('submit', async (e) => {
        // console.log("update form", username)
        e.preventDefault()
        var formdata = new FormData(update_form)
        // console.log(formdata);

        output = ""
        for (const [key, value] of formdata) {
            output += `${key}: ${value}\n`;
        }
        console.log(output)
        var options = {
            method: 'POST',
            body: formdata
        }
        try {
            var res = await fetch("http://localhost:5000/update_employee", options)
            var res_json = await res.json()
            console.log("response after data change",res_json)
            update_form_container.style.display = "none"
            display_table(username)
        }
        catch (err) {
            console.log(err)
        }
    })
}

async function delete_data(element, username) {
    confirmation = window.confirm("Do you want to delete the employee?")

    if (confirmation) {
        var td = element.parentNode
        var tr = td.parentNode
        var row_data = tr.getElementsByTagName("td")
        // console.log(row_data)
        var doc_id = row_data[5].innerText
        // console.log(doc_id)
        // console.log(username)

        var options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                contact: doc_id
            })
        }
        try {
            var response = await fetch("http://localhost:5000/delete_employee", options)
            var json_res = await response.json()
            console.log("response after delete data",json_res)
            display_table(username)
        }
        catch (err) {
            console.log(err)
        }
    }
}


async function display_table(username) {
    // console.log("display_table_func")
    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username
        })
    }
    try {
        var all_employee = await fetch("http://localhost:5000/display_employees", options)
        var json_all_employee = await all_employee.json()
        console.log("response after display",json_all_employee)

        var table = `<tr id="column_titles"> 
                     <td></td>
                     <td>First name</td>
                     <td>Last name</td>
                     <td>Middle name</td>
                     <td>Email</td>
                     <td>Contact</td>
                     <td>Address</td>
                     <td>City</td>
                     <td>DOB</td>
                     <td>Options</td>
                 </tr>`;

        function create_rows(doc) {
            var row = "";

            var first_name = doc.first_name;
            var last_name = doc.last_name;
            var middle_name = doc.middle_name;
            var email = doc.email_f;
            var contact = doc.contacy_f;
            var address = doc.address_f;
            var city = doc.city_f;
            var Dob = doc.DOB;
            var img_received = doc.image_url;
            var initials = doc.user_initial;
            // console.log(img_received);

            if (Dob == undefined) {
                Dob = ""
            }
            if (middle_name == undefined) {
                middle_name = ""
            }
            if (last_name == undefined) {
                last_name = ""
            }
            if (email == undefined) {
                email = ""
            }
            if (contact == undefined) {
                contact = ""
            }
            if (address == undefined) {
                address = ""
            }
            if (city == undefined) {
                city = ""
            }

            if (img_received) {
                row = `<tr id="${contact}">
                     <td>
                         <img id="${contact}" class="image_down" src="${img_received}">
                     </td>
                     <td>${first_name}</td>
                     <td>${last_name}</td>
                     <td>${middle_name}</td>
                     <td>${email}</td>
                     <td>${contact}</td>
                     <td>${address}</td>
                     <td>${city}</td>
                     <td>${Dob}</td>
                     <td id="options">
                         <button id="edit_btn" class="edit_btn"><i class="fa-solid fa-pen"></i></button>
                         <button id="dlt_btn" class="dlt_btn"><i class="fa-solid fa-trash"></i></button>
                     </td>
                 </tr>`;

                table = table + row;
            }
            else {
                row = `<tr id="${contact}">
                     <td>
                         <div id="${contact}" class="image_down1">${initials}</div>
                     </td>
                     <td>${first_name}</td>
                     <td>${last_name}</td>
                     <td>${middle_name}</td>
                     <td>${email}</td>
                     <td>${contact}</td>
                     <td>${address}</td>
                     <td>${city}</td>
                     <td>${Dob}</td>
                     <td id="options">
                         <button id="edit_btn" class="edit_btn"><i class="fa-solid fa-pen"></i></button>
                         <button id="dlt_btn" class="dlt_btn"><i class="fa-solid fa-trash"></i></button>
                     </td>
                 </tr>`;

                table = table + row;

            }


        }

        json_all_employee.forEach(create_rows);

        document.getElementById("table").innerHTML = table;

        const editButton = document.getElementsByClassName("edit_btn");
        // console.log(editButton);

        for (var i = 0; i < editButton.length; i++) {
            editButton[i].addEventListener("click", function () {
                change_data(this, username);
            });
        }

        const delButton = document.getElementsByClassName("dlt_btn");
        for (var i = 0; i < delButton.length; i++) {
            delButton[i].addEventListener("click", function () {
                delete_data(this, username);
            });
        }

        const tr = document.getElementsByTagName('tr')
        for (var i = 1; i < tr.length; i++) {
            var rowdata = tr[i].getElementsByTagName('td')
            for (var j = 0; j < (rowdata.length - 1); j++) {
                rowdata[j].addEventListener('click', function () {
                    show_data(this)
                })
            }
        }
    }
    catch (err) {
        console.log(err)
    }
}
function show_data(elem) {
    var tr = elem.parentNode
    var td = tr.getElementsByTagName('td')

    var first_td = td[0].childNodes[1]
    // console.log(first_td)
    // console.log(first_td.nodeName)
    document.getElementById("table_details").style.display = "flex"

    if (first_td.nodeName == "IMG") {
        document.getElementById("itm_image").innerHTML = `<img src="${first_td.src}" class="image_received">`;
        document.getElementById("first_name3").value = td[1].innerText;
        document.getElementById("last_name3").value = td[2].innerText;
        document.getElementById("middle_name3").value = td[3].innerText;
        document.getElementById("email3").value = td[4].innerText;
        document.getElementById("contact3").value = td[5].innerText;
        document.getElementById("address3").value = td[6].innerText;
        document.getElementById("city3").value = td[7].innerText;
        document.getElementById("dob3").value = td[8].innerText;
        document.getElementById("image_name").innerHTML = td[1].innerText + " " + td[2].innerText;
    }
    else {
        document.getElementById("itm_image").innerHTML = first_td.innerText;
        document.getElementById("first_name3").value = td[1].innerText;
        document.getElementById("last_name3").value = td[2].innerText;
        document.getElementById("middle_name3").value = td[3].innerText;
        document.getElementById("email3").value = td[4].innerText;
        document.getElementById("contact3").value = td[5].innerText;
        document.getElementById("address3").value = td[6].innerText;
        document.getElementById("city3").value = td[7].innerText;
        document.getElementById("dob3").value = td[8].innerText;
        document.getElementById("image_name").innerHTML = td[1].innerText + " " + td[2].innerText;
    }

}
const sign_in_btn = document.getElementById("sign_inbtn")
sign_in_btn.addEventListener("click", async function () {
    var email = document.getElementById("sign_email").value
    var password = document.getElementById("sign_password").value
    // console.log(email, password)

    var options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: email,
            password: password
        })
    }
    try {
        var response = await fetch("http://localhost:5000/login", options)
        response_json = await response.json()
        console.log("response after login",response_json)
        login_status = response_json.login_status
        username = response_json.username

        if (login_status) {
            sign_in_form = document.getElementById("sign_in_form")
            sign_in_form.style.display = "none"
            mainscreen = document.getElementById("mainscreen")
            mainscreen.style.display = "block"
            display_table(username)
        }
        else {
            window.alert("Invalid username or password")
        }
    }
    catch (err) {
        console.log(err)
    }
})
document.getElementById("search_btn").addEventListener('click', function(){
    search_record()
})
function search_record() {
    var search_value = "";
    search_value = document.getElementById("search_value").value;
    

    // console.log(search_value);
    var tr = document.getElementsByTagName("tr");
    // console.log(tr);

    for (var i = 1; i < tr.length; i++) {
        if (tr[i].id.indexOf(search_value) > -1) {
            tr[i].style.backgroundColor = "rgb(30 191 133)";
            tr[i].style.color = "white";
            tr[i].style.border = " 1px solid rgb(172, 172, 172)"
        }
        if (search_value == "" && (i % 2) == 1) {
            tr[i].style.backgroundColor = "#f2f2f2";
            tr[i].style.color = "black";
            tr[i].style.border = "";
        }
        if (search_value == "" && (i % 2) == 0) {
            tr[i].style.backgroundColor = "white";
            tr[i].style.color = "black";
            tr[i].style.border = "";
        }
        if (tr[i].id.indexOf(search_value) == -1 && (i % 2) == 1) {
            tr[i].style.backgroundColor = "#f2f2f2"
            tr[i].style.color = "black"
            tr[i].style.border = "";
        }
        if (tr[i].id.indexOf(search_value) == -1 && (i % 2) == 0) {
            tr[i].style.backgroundColor = "white";
            tr[i].style.color = "black"
            tr[i].style.border = "";
        }
    }
    
}