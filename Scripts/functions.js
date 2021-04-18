let url = 'https://softwiki-75956-default-rtdb.europe-west1.firebasedatabase.app/'
function registerUser(context) {
    let { email, password, rePassword } = context.params;

    if (password == rePassword) {
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(function ({ user: {uid, email}}) {
                localStorage.setItem('userInfo', JSON.stringify({ uid, email }))
            })
            .then(function () {context.redirect('/home');})
            .catch(function (err) {console.log(err);})
    }
}

function loginUser(context) {
    let { email, password } = context.params;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function ({ user: {uid, email}}) {
            localStorage.setItem('userInfo', JSON.stringify({ uid, email }))
        })
        .then(function () {context.redirect('/home');})
        .catch(function (err) { console.log(err); })
}

function articles(context) {
    context.javaScript = {};
    context.cSharp = {};
    context.java = {};
    context.pyton = {};

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
                } else if (tolower == 'pyton') {
                    context.pyton[key] = data[key];
                }
            }
        })
        .then(() => {
            let userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                context.login = true;
            }
            if (!context.login) {
                context.redirect('/register');
                return
            }
            context.loadPartials({
                'header': './templates/header.hbs',
                'footer': './templates/footer.hbs'
            })
                .then(function () {
                    this.partial('./templates/home.hbs');
                })
        })
        .catch(function (err) { console.log(err);})
}

function createArticles(context) {
    let {params:{title,content,category}} = context;
    let email = JSON.parse(localStorage.getItem('userInfo')).email;

    if (title != '' && content != '' && category != '' && email != '') {
        fetch(`${url}/articles.json`,{
            headers: {'Content-Type': 'application/json'},
            method: 'POST',
            body: JSON.stringify({title,content,category,email})
        })
        .then((res) => {context.redirect('/home');})
    }

}