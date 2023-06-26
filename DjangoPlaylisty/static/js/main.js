//DOM ELEMENTS
const searchInput = document.getElementById("search-input")
const csrf_token = document.querySelector('input[name="csrfmiddlewaretoken"]').value
const resultsWrapper = document.querySelector('.results-container ul')
const resultsContainer = document.querySelector('.results-container')
const generatePlaylistButton = document.getElementById("generate-playlist-button")
const playlistContainer = document.querySelector('.playlist-container')
const selectMenu = document.getElementById("select-menu")

var selectedItems = { items: [] }
var count = 0; //playlist items count
var timer = null //timer to delay the requests

//User typed in search input
searchInput.addEventListener('input', function (event) {
    startTimerAndFetch();
});


// Count 500ms and if the user hasnt typed again, fetch. If not, it restarts the timer
function startTimerAndFetch() {
    resultsContainer.classList.remove('show');
    clearTimeout(timer) //reset timer
    timer = setTimeout(fetchData, 500);
}

async function fetchData() {
    resultsWrapper.innerHTML = `` //reset results
    let str = searchInput.value
    if (str == "") {
        return;
    }
    const response = await fetch(`./createplaylist/getitem/${str}/${getCurrentType()}`); //peticion GET
    const data = await response.json();
    if (data.status == "success") {
        updateResults(data)
    }
    else {
        location.reload();
    }
}

function updateResults(data) {
    if (data.results.length == 0) {
        resultsWrapper.innerHTML += `<h2 class="">Not found</h2>`//no results 
        document.querySelector('#create-playlist h2').classList.add('show');
        resultsContainer.classList.add('show');
        return;
    }
    resultsWrapper.innerHTML = `` //reset results
    data.results.forEach((result) => {
        addResultToDom(result)
    });
    document.querySelectorAll('.results-container ul li').
        forEach(function (item) {
            item.addEventListener('click', () => {
                resultsContainer.classList.remove('show');
                searchInput.value = ``
                addToPlaylistContainer(item.textContent, item.getAttribute('id-value'), item.getAttribute('type-value'), item.querySelector('img').getAttribute('src'));
                setTimeout(() => {
                    resultsWrapper.innerHTML = ``
                }, 500);
            });
        });
    setTimeout(() => {
        resultsContainer.classList.add('show');
    }, 100);
}

function addResultToDom(result) {
    let image = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/168px-Spotify_logo_without_text.svg.png"
    if (result.type != "track") { //track doesnt contain images
        image = result.images.length > 0 ? result.images[0].url : "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/168px-Spotify_logo_without_text.svg.png"
    }
    resultsWrapper.innerHTML +=
        `<li id-value="${result.id}" type-value="${result.type}">
        <img src="${image}" alt="${result.name}">
        ${result.name}
    </li>`
}

function addToPlaylistContainer(name, id, type, image) {
    count += 1;
    let content =
        `<li id-value="${id}" type-value="${type}">
            <div class="left">
                <h2>${count}</h2>
            <img src="${image}" alt="">
            <div class="name-type-container">
                <p class="name">${name}</p>
                <p class="type">${type}</p>
            </div>  
            </div>
    `
    if (type == "artist") {
        content +=
            `<div class="right">
        <select name="options">
          <option value="top-tracks">top 10 tracks</option>
          <option value="all-tracks">all tracks</option>
        </select>
      </div>`
    }
    else if (type == "track") {
        content +=
            `<div class="right">
        <select name="options">
          <option value="just-this">just this track</option>
          <option value="similar-tracks">similar Songs</option>
        </select>
      </div>`
    }
    else if (type == "album") {
        content +=
            `<div class="right">
        <select name="options">
          <option value="all-tracks">all tracks</option>
        </select>
      </div>`
    }
    content += `</li>`
    playlistContainer.innerHTML += content;
}

//Boton pulsado
generatePlaylistButton.addEventListener('click', (e) => {
    e.preventDefault();
    let playlistItems = document.querySelectorAll('.playlist-container li');
    playlistItems.forEach((item) => {
        let id = item.getAttribute('id-value');
        let type = item.getAttribute('type-value');
        let option = item.querySelector('select').value;
        let object = { id: id, type: type, option: option }
        selectedItems.items.push(object);
    });
    let url = "/getplaylist/"
    fetch(url, {
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
            if (data.message == "failed"){
                console.log("Error ocurred");
                return;
            }
            window.location.href = data.url
        })
        .catch(error => {
            console.error('Error:', error);
        });

});

function getCurrentType() {
    return selectMenu.value;
}

selectMenu.addEventListener('change', function (event) {
    startTimerAndFetch();
});