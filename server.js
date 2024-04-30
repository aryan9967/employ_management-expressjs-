import dotenv from 'dotenv'
dotenv.config()
import express from "express"
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"
import { getFirestore, addDoc, collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import bodyParser from 'body-parser';
import multer from 'multer';
// import formidable from 'formidable';
const upload = multer({ dest: 'uploads/' })
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import fs from "fs"

const express_app = express()

express_app.use(bodyParser.json())

console.log(process.env.apiKey)

const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
  measurementId: process.env.measurementId
};

// Initialize Firebase
const app1 = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app1);

var user_status = false

const auth = getAuth(app1)

express_app.use((req, res, next)=>{
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

async function verify_user(username, password) {
  try {
    console.log(username, password)
    var email = username
    const usercredential = await signInWithEmailAndPassword(auth, email, password)
    // console.log(usercredential.user)
    onAuthStateChanged(auth, user => {
      if (user) {
        console.log("verification is done")
        user_status = true
      }
      else {
        console.log("cannot be verified")
        user_status = false
      }
    })
  }
  catch (error) {
    // console.log(error)
    console.log("Enter valid email and password")
    user_status = false
  }
}

express_app.use("/login", function (req, res, next) {
  console.log(req.body.username)

  var username = req.body.username
  var password = req.body.password
  console.log(user_status)

  verify_user(username, password)
    .then(() => {
      // Update user_status based on verification result
      next();
    });
})

express_app.post("/login", function (req, res) {

  console.log(user_status)

  if (user_status == true) {
    var response = {
      username: req.body.username,
      login_status: true
    }
    res.send(JSON.stringify(response))
  }
  else {
    var response = {
      login_status: false
    }
    res.send(JSON.stringify(response))
  }
})

var employee_data = []
var querySnapshot = "";
async function get_data() {
  querySnapshot = await getDocs(collection(db, "employees"));
  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    employee_data.push(doc.data());
    console.log(employee_data)
  });
}

express_app.post("/display_employees", async function (req, res) {
  var username = req.body.username
  console.log(username)
  if (username) {
    await get_data()
    res.send(JSON.stringify(employee_data))
    employee_data = []
  }
})


express_app.post("/add_employee", upload.single("file"), async (req, res) => {
  console.log("Body: ", req.body);
  console.log("File: ", req.file);

  // console.log(buffer)
  // console.log(buffer.encoding)
  const storage = getStorage()

  var firstname = ""
  var lastname = ""
  var middlename = ""
  var email = ""
  var contact = ""
  var address = ""
  var city = ""
  var dob = ""

  firstname = req.body.firstname
  lastname = req.body.lastname
  middlename = req.body.middlename
  email = req.body.email
  contact = req.body.contact
  address = req.body.address
  city = req.body.city
  dob = req.body.dob
  console.log("contact:" + contact)

  if (middlename) {
    console.log("middlename is provided:" + middlename)
  }
  else {
    middlename = ""
  }
  if (firstname && lastname && email && contact && address && city && dob) {
    var initial = firstname.slice(0, 1)
    var final_initial = initial.toUpperCase()
    // console.log(final_initial)
    if (req.file) {
      console.log(req.file.path)
      const buffer = fs.readFileSync(req.file.path)
      const metadata = {
        contentType: req.file.mimetype
      };

      const storageRef = ref(storage, 'images/' + contact);

      const snapshot = await uploadBytesResumable(storageRef, buffer, metadata)
      const download_url = await getDownloadURL(snapshot.ref)
      console.log(download_url)

      await setDoc(doc(db, "employees", contact), {
        first_name: firstname,
        last_name: lastname,
        middle_name: middlename,
        email_f: email,
        contacy_f: contact,
        address_f: address,
        city_f: city,
        image_url: download_url,
        DOB: dob,  
        user_initial: final_initial
      });
      fs.unlinkSync(`./uploads/${req.file.filename}`, function (err) {
        if (err) {
          return console.error(err);
        }
        console.log("File deleted successfully!");
      });
      res.send(JSON.stringify("File successfully uploaded."));
    }
    else {
      await setDoc(doc(db, "employees", contact), {
        first_name: firstname,
        last_name: lastname,
        middle_name: middlename,
        email_f: email,
        contacy_f: contact,
        address_f: address,
        city_f: city,
        DOB: dob,  
        user_initial: final_initial
      });
      res.send(JSON.stringify("employee created successfully"))
    }
  }
  else {
    if (req.file) {
      fs.unlinkSync(`./uploads/${req.file.filename}`, function (err) {
        if (err) {
          return console.error(err);
        }
        console.log("File deleted successfully!");
      });
      res.send(JSON.stringify("invalid data"))
    }
    else{
      res.send(JSON.stringify("invalid data"))
    }
  }

});

express_app.post("/update_employee", upload.single("file"), async (req, res) => {
  console.log("Body: ", req.body);
  console.log("File: ", req.file);

  // console.log(buffer)
  // console.log(buffer.encoding)
  const storage = getStorage()

  var firstname = ""
  var lastname = ""
  var middlename = ""
  var email = ""
  var contact = ""
  var address = ""
  var city = ""
  var dob = ""

  firstname = req.body.first_name
  lastname = req.body.last_name
  middlename = req.body.middle_name
  email = req.body.email
  contact = req.body.contact
  address = req.body.address
  city = req.body.city
  dob = req.body.dob
  console.log("contact:" + contact)

  if (middlename) {
    console.log("middlename is provided:" + middlename)
  }
  else {
    middlename = ""
  }
  if (firstname && lastname && email && contact && address && city && dob) {
    var initial = firstname.slice(0, 1)
    var final_initial = initial.toUpperCase()
    if (req.file) {
      console.log(req.file.path)
      const buffer = fs.readFileSync(req.file.path)
      const metadata = {
        contentType: req.file.mimetype
      };

      const storageRef = ref(storage, 'images/' + contact);

      const snapshot = await uploadBytesResumable(storageRef, buffer, metadata)
      const download_url = await getDownloadURL(snapshot.ref)
      console.log(download_url)

      await updateDoc(doc(db, "employees", contact), {
        first_name: firstname,
        last_name: lastname,
        middle_name: middlename,
        email_f: email,
        contacy_f: contact,
        address_f: address,
        city_f: city,
        DOB: dob,
        image_url: download_url,
        user_initial: final_initial
      });
      fs.unlinkSync(`./uploads/${req.file.filename}`, function (err) {
        if (err) {
          return console.error(err);
        }
        
      });
      console.log("File deleted successfully!");
      res.send(JSON.stringify("File successfully uploaded."));
    }
    else {
      await updateDoc(doc(db, "employees", contact), {
        first_name: firstname,
        last_name: lastname,
        middle_name: middlename,
        email_f: email,
        contacy_f: contact,
        address_f: address,
        city_f: city,
        DOB: dob,
        user_initial: final_initial
      });
      res.send(JSON.stringify("employee updated successfully"))
    }
  }
  else {
    if (req.file) {
      fs.unlinkSync(`./uploads/${req.file.filename}`, function (err) {
        if (err) {
          return console.error(err);
        }
        console.log("File deleted successfully!");
      });
      res.send(JSON.stringify("invalid data"))
    }
    else{
      res.send(JSON.stringify("invalid data"))
    }
  }

});

express_app.post("/delete_employee", async function(req, res){
  var contact = req.body.contact
  var user = req.body.username
  if(user){
    if(contact){
      await deleteDoc(doc(db, "employees", contact))
      res.send(JSON.stringify("document deleted successfully"))
    }
    else{
      res.send(JSON.stringify("Credentials are not provided"))
    }
  }
  else{
    res.send(JSON.stringify("Not logined"))
  }
})
express_app.listen(5000)