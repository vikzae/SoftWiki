let url = 'https://softwiki-75956-default-rtdb.europe-west1.firebasedatabase.app'
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
        .catch(function (err) { console.log(err);})
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
            //if no articles to show no articles
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

function detailsId(context) {
    let {params:{id}} = context;
    
    fetch(`${url}/articles/${id}.json`)
    .then((res) => res.json())
    .then((res) => {
        context.category = res.category;
        context.content = res.content;
        context.title = res.title;
        context.email = res.email;
        let currentEmail = JSON.parse(localStorage.getItem('userInfo')).email;
        context.isCreator = false;
        
        if (context.email == currentEmail) {
            context.isCreator = true;
        }

        let userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            context.login = true;
        }

        context.loadPartials({
            'header': './templates/header.hbs',
            'footer': './templates/footer.hbs'
        })
        .then(function() {
            this.partial('./templates/details.hbs');
        })
    })
}

function editId(context) {
    let {params:{id}} = context
    window.id = id;

    let userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            context.login = true;
        }

    fetch(`${url}/articles/${id}.json`)
    .then((res) => res.json())
    .then((data) => {
        context.category = data.category;
        context.content = data.content;
        context.title = data.title;
        context.creator = data.creator;
    })
    .then(() => {
        context.loadPartials({
            'header': './templates/header.hbs',
            'footer': './templates/footer.hbs'
        })
        .then(function() {
            this.partial('./templates/edit.hbs');
        })
    })
}

function edited(context) {
    let {params:{category,content,title}} = context;
    fetch(`${url}/articles/${window.id}.json`,{
        headers: {'Content-Type': 'application/json'},
        method: 'PATCH',
        body: JSON.stringify({category,content,title})
    })
    .then((res) => context.redirect('/home'))
    .catch((err) => console.log(err))
}

function deleteArticle(context) {
    let {params:{id}} = context;
    fetch(`${url}/articles/${id}.json`,{
        headers: {'Content-Type': 'application/json'},
        method: 'DELETE',
    })
    .then((res) => context.redirect('/home'))
}