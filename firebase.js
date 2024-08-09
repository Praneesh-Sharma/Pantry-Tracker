// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBwhMRd99KhFgnWzYJ750ziouqjbo5uwI",
  authDomain: "pantry-tracker-app-cd5b3.firebaseapp.com",
  projectId: "pantry-tracker-app-cd5b3",
  storageBucket: "pantry-tracker-app-cd5b3.appspot.com",
  messagingSenderId: "573700541413",
  appId: "1:573700541413:web:460fc56211a956630d7d0c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// const auth = getAuth(app);
// export { auth };

const firestore = getFirestore(app);
export{app, firestore}