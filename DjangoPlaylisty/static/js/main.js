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
    const response = await fetch(`./getitem/${str}/${getCurrentType()}`); //peticion GET
    const data = await response.json();
    if (data.status == "success") {
        updateResults(data) 
    }
    else {
        console.log("Error");
        window.location.href = "/ups"
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
                addItemToPlaylistContainer(item.textContent, item.getAttribute('id-value'), item.getAttribute('type-value'), item.querySelector('img').getAttribute('src'));
                setTimeout(() => {
                    resultsWrapper.innerHTML = ``
                }, 500);
            });
        });
    setTimeout(() => {
        resultsContainer.classList.add('show');
    }, 100);
}

//Add to the DOM the fetched items results.
function addResultToDom(result) {
//track doesnt contain images
    image = result.images[0].url
    resultsWrapper.innerHTML +=
        `<li id-value="${result.id}" type-value="${result.type}">
        <img src="${image}" alt="${result.name}">
        ${result.name}
    </li>`
}

//Adds an item to the playlist container with its own options depending on the item
function addItemToPlaylistContainer(name, id, type, image) {
    count += 1;
    let content =
        `<li id-value="${id}" type-value="${type}">
            <div class="left">
            <img src="${image}" alt="">
            <div class="name-type-container">
                <p class="name">${name}</p>
                <p class="type">${type}</p>
            </div>  
            </div>
    `
    switch (type) {
        case "artist":
            content +=
                `<div class="right">
              <select name="options">
                <option value="top-tracks">top 10 tracks</option>
                <option value="all-tracks">all tracks</option>
              </select>
              <button class="button" onclick="deleteElement(this)">
              <svg viewBox="0 0 448 512" class="svgIcon"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"></path></svg>
            </button>
            </div>`;
            break;

        case "track":
            content +=
                `<div class="right">
              <select name="options">
                <option value="just-this">just this track</option>
                <option value="similar-tracks">similar Songs</option>
              </select>
            </div>`;
            break;

        case "album":
            content +=
                `<div class="right">
              <select name="options">
                <option value="all-tracks">all tracks</option>
              </select>
            </div>`;
            break;
    }

    content += `</li>`
    playlistContainer.innerHTML += content;
    var item = document.querySelector('.playlist-container li[id-value="' + id + '"]');
    console.log('item :>> ', item);
    setTimeout(() => {
        item.classList.add('show')
    }, 400);
    
}


//Generate playlist button clicked, 
generatePlaylistButton.addEventListener('click', (e) => {
    e.preventDefault();
    let playlistItems = document.querySelectorAll('.playlist-container li');
    playlistItems.forEach((item) => {

        let object = {
            id: item.getAttribute('id-value'),
            type: item.getAttribute('type-value'),
            option: item.querySelector('select').value
        }
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
            if (data.message == "failed") {
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

function deleteElement(button) {
    // Obtén el elemento <li> que contiene el botón
    var listItem = button.closest("li");
    
    // Elimina el elemento <li> de la lista
    listItem.classList.remove('show')
    setTimeout(() => {
        listItem.remove();
    }, 400);
    
}
