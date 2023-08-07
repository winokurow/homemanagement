const admin = require("firebase-admin")

admin.initializeApp({
    credential: admin.credential.cert("C://Users/ilja_/Downloads/serviceAccountKey.json"),
    databaseURL: "https://zottig-planer.firebaseio.com/"
})

const uid = "AjByqEqtw1h6Gn04nQ6DlESiJmz1"

return admin
    .auth()
    .setCustomUserClaims(uid, { role: 'planer' })
    .then(() => {
        // The new custom claims will propagate to the user's ID token the
        // next time a new one is issued.
        console.log(`Admin claim added to ${uid}`)
    });