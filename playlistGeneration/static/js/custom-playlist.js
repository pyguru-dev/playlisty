const csrf_token = document.querySelector('input[name="csrfmiddlewaretoken"]').value
const playlistItems = document.querySelectorAll('.playlist-container li')
const createPlaylistButton = document.getElementById('generate-playlist-button')
const nameInputValue = document.getElementById('name-input')

var items_ids = []

playlistItems.forEach((item) => {
    items_ids.push(item.getAttribute('id-value'));
})

function deleteElement(button) {
    // Obtén el elemento <li> que contiene el botón
    var listItem = button.closest("li");
    items_ids.pop(listItem.getAttribute('id-value'))
    // Elimina el elemento <li> de la lista
    listItem.classList.remove('show')
    setTimeout(() => {
        listItem.remove();
        if (items_ids.length == 0) {
            emptyPlaylist.classList.remove('hide')
        }
    }, 400);
    if (items_ids.length == 0) {
        alert("Emty playlist")
        window.location.href = "/"
    }
}

function turnOnLoader() {
    const section = document.querySelector('#custom-playlist')
    section.classList.add('opacity')
    const loader = document.querySelector('.loader-container')
    loader.classList.add('show')
}

function turnOffLoader() {
    const section = document.querySelector('#custom-playlist')
    section.classList.remove('opacity')
    const loader = document.querySelector('.loader-container')
    loader.classList.remove('show')
}


createPlaylistButton.addEventListener('click', async (e) => {
    e.preventDefault()
    if (items_ids.length == 0) {
        alert("Add items to your playlist!");
        return;
    }
    const loggedIn = await checkLoggedIn()
    console.log(loggedIn);
    if (!loggedIn) {
        console.log("no logeado");
        let url = "/auth/"
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrf_token,

            },
            body: JSON.stringify(window.location.href)
        })
            .then(
                response => response.json()
            )
            .then(data => {
                window.location.href = data.auth_url
            })
        return;
    }
    turnOnLoader()
    let selectedItems = { name: nameInputValue.value, items: items_ids }

    fetch( "./getplaylist/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrf_token
        },
        body: JSON.stringify(selectedItems)
    })
        .then(
            response => response.json()
        ).then(data => {
            if (data.message == "not logged in") {
                turnOffLoader()
                let queryString = encodeURIComponent(JSON.stringify({ url: window.location.href }))
                window.location.href = '/auth/?data=' + "hola"
                return;
            }
            if (data.message == "failed") {
                console.log("Error ocurred");
                return;
            }
            let queryString = encodeURIComponent(JSON.stringify({ url: data.url, id: data.id }))
            setTimeout(() => {
                window.location.href = './generatedplaylist/?data=' + queryString
            }, 4000)

        })
        .catch(error => {
            console.error('Error:', error);
        });
});


async function checkLoggedIn() {
    let url = "/getloginstatus/";
    let loggedIn = false;
    try {
        const response = await fetch(url);
        const data = await response.json();
        loggedIn = data.status;
    }
    catch {
        loggedIn = false;
    }
    return loggedIn;
}