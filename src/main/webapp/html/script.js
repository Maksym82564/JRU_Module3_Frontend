let playersCount = 0;
let playersPerPage = 3;
let playersAmount = 0;
let currentPageNumber = 0;

createAccountPerPageDropDown();
fillTable(0, playersPerPage);
getPlayersCount();

function fillTable(pageNumber, pageSize) {
    $.get(`rest/players?pageNumber=${pageNumber}&pageSize=${pageSize}`, (players) => {
        const $playersTableBody = $('.players-table-body')[0];
        let htmlRows = '';
        players.forEach((player) => {
            htmlRows +=
                `<tr>
                    <td class="character-cell">${player.id}</td>
                    <td class="character-cell">${player.name}</td>
                    <td class="character-cell">${player.title}</td>
                    <td class="character-cell">${player.race}</td>
                    <td class="character-cell">${player.profession}</td>
                    <td class="character-cell">${player.level}</td>
                    <td class="character-cell">${player.birthday}</td>
                    <td class="character-cell">${player.banned}</td>
                </tr>`
        })

        Array.from($playersTableBody.children).forEach(row => row.remove());

        $playersTableBody.insertAdjacentHTML("beforeend",htmlRows);
    })
}

function getPlayersCount() {
    $.get("rest/players/count", (count) => {
        playersCount = count;
        updatePaginationButtons();
    })
}

function updatePaginationButtons() {
    if (playersCount === 0) {
        playersAmount = 0;
    }
    else {
        playersAmount = Math.ceil(playersCount / playersPerPage);
    }

    const $pageButtonsContainer = $('.pagination-buttons')[0];
    const childButtonsCount = $pageButtonsContainer.children.length;

    let paginationButtonHtml = '';

    for (let i = 1; i < playersAmount; i++) {
        paginationButtonHtml += `<button value="${i - 1}" class="pagination-button">
                                    ${i}
                                 </button>`;
    }

    if (childButtonsCount !== 0) {
        Array.from($pageButtonsContainer.children).forEach(node => node.remove())
    }

    $pageButtonsContainer.insertAdjacentHTML("beforeend", paginationButtonHtml);
}

function createAccountPerPageDropDown() {
    const $dropDown = $('.accounts-per-page')[0];
    const options = createSelectOptions([3, 5, 10, 20], 3);
    $dropDown.addEventListener('change', onPlayersPerPageChangeHandler);
    $dropDown.insertAdjacentHTML('afterbegin', options);
}

function createSelectOptions(optionsArray, defaultValue) {
    let optionHtml = '';

    optionsArray.forEach(option => {
        optionHtml +=
            `<option ${defaultValue === option && 'selected'} value="${option}">
                ${option}
            </option>`;
    })

    return optionHtml;
}

function onPlayersPerPageChangeHandler(e) {
    playersPerPage = e.currentTarget.value;
    fillTable(currentPageNumber, playersPerPage);
    updatePaginationButtons();
}