let url = 'https://softwiki-75956-default-rtdb.europe-west1.firebasedatabase.app/'
function registerUser(context) {
    let { email, password, rePassword } = context.params;
    if (password == rePassword) {
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(function ({ user: { uid, email } }) {
                localStorage.setItem('userInfo', JSON.stringify({ uid, email }))
            })
            .then(function () { context.redirect('/home'); })
            .catch(function (err) { console.log(err); })
    }
}

function loginUser(context) {
    let { email, password } = context.params;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function ({ user: { uid, email } }) {
            localStorage.setItem('userInfo', JSON.stringify({ uid, email }))
        })
        .then(function () { context.redirect('/home') })
        .catch(function (err) { console.log(err); })
}

function articles(context) {
    context.javaScript = {};
    context.cSharp = {};
    context.java = {};
    context.python = {};

    fetch(`${url}/articles.json`)
        .then(res => res.json())
        .then(data => {

            for (const key in data) {
                let category = data[key].category;
                let tolower = category.toLowerCase();  
                
                if (tolower == 'javascript') {
                    context.javaScript[key] = data[key];
                } else if (tolower == 'csharp' || tolower == 'c#') {
                    context.cSharp[key] = data[key];
                } else if (tolower == 'java') {
                    context.java[key] = data[key];
                } else if (tolower == 'python') {
                    context.python[key] = data[key];
                }
            }
        })
        .then(() => {
            let userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                context.login = true;
            }
            if (!context.login) {
                context.redirect('/register')
                return
            }
            context.loadPartials({
                'header': './templates/header.hbs',
                'footer': './templates/footer.hbs'
            })
                .then(function () {
                    this.partial('./templates/home.hbs')
                })
        })
        .catch(function (err) { console.log(err) })
}