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
                `<tr class="table-row" data-account-id="${player.id}">
                    <td class="character-cell">${player.id}</td>
                    <td class="character-cell">${player.name}</td>
                    <td class="character-cell">${player.title}</td>
                    <td class="character-cell">${player.race}</td>
                    <td class="character-cell">${player.profession}</td>
                    <td class="character-cell">${player.level}</td>
                    <td class="character-cell">${player.birthday}</td>
                    <td class="character-cell">${player.banned}</td>
                    <td class="character-cell">
                        <button class="edit-button" value="${player.id}">
                        <img class="edit-image" src="../img/edit.png" alt="edit"
                        </button>
                    </td>
                    <td class="character-cell">
                        <button class="delete-button" value="${player.id}">
                        <img class="delete-image" src="../img/delete.png" alt="delete"
                        </button>
                    </td>
                </tr>`
        })

        Array.from($playersTableBody.children).forEach(row => row.remove());

        $playersTableBody.insertAdjacentHTML("beforeend",htmlRows);

        const $deleteButtons = $('.delete-button').toArray();
        $deleteButtons.forEach(button => button.addEventListener('click', deleteAccountHandler));

        const $editButtons = $('.edit-button').toArray();
        $editButtons.forEach(button => button.addEventListener('click', editAccountHandler));
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

    for (let i = 1; i <= playersAmount; i++) {
        paginationButtonHtml += `<button value="${i - 1}" class="pagination-button">
                                    ${i}
                                 </button>`;
    }

    if (childButtonsCount !== 0) {
        Array.from($pageButtonsContainer.children).forEach(node => node.remove())
    }

    $pageButtonsContainer.insertAdjacentHTML("beforeend", paginationButtonHtml);

    Array.from($pageButtonsContainer.children).forEach(button =>
        button.addEventListener('click', onPageChange))

    changeActiveButton(currentPageNumber);
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
    currentPageNumber = 0;
    fillTable(currentPageNumber, playersPerPage);
    updatePaginationButtons();
}

function onPageChange(e) {
    const targetPageIndex = e.currentTarget.value;
    changeActiveButton(targetPageIndex);

    currentPageNumber = targetPageIndex;
    fillTable(currentPageNumber, playersPerPage);
    changeActiveButton(currentPageNumber);
}

function changeActiveButton(activePageButton = 0) {
    const $paginationButtons = document.querySelector('.pagination-buttons');
    const $targetButton = Array.from($paginationButtons.children)[activePageButton];
    const $currentActiveButton = Array.from($paginationButtons.children)[currentPageNumber];

    $currentActiveButton.classList.remove('selected-pagination-button');
    $targetButton.classList.add('selected-pagination-button');
}

function deleteAccountHandler(e) {
    const accountId = e.currentTarget.value;

    $.ajax({
        url: `/rest/players/${accountId}`,
        type: 'DELETE',
        success: function () {
            getPlayersCount();
            currentPageNumber = currentPageNumber > 0 ? currentPageNumber - 1 : 0;
            fillTable(currentPageNumber, playersPerPage)
        }
    })
}

function editAccountHandler(e) {
    const accountId = e.currentTarget.value;

    const $currentRow = $(`.table-row[data-account-id='${accountId}']`);
    const $currentImage = $currentRow.find('.edit-button img');

    $currentImage.attr('src',"../img/save.png");
}