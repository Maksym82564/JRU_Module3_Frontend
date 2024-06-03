let playersCount = 0;
let playersPerPage = 3;
let playersAmount = 0;
let currentPageNumber = 0;

const PROFESSION = ['WARRIOR', 'ROGUE', 'SORCERER', 'CLERIC', 'PALADIN', 'NAZGUL', 'WARLOCK', 'DRUID'];
const RACE = ['HUMAN', 'DWARF', 'ELF', 'GIANT', 'ORC', 'TROLL', 'HOBBIT'];
const BANNED = ['true', 'false'];

createAccountPerPageDropDown();
initCreateForm();
fillTable(currentPageNumber, playersPerPage);
getPlayersCount();

function initCreateForm() {
    const $raceSelect = document.querySelector('[data-create-race]');
    const $professionSelect = document.querySelector('[data-create-profession]');
    const $bannedSelect = document.querySelector('[data-create-banned]');

    $raceSelect.insertAdjacentHTML('afterbegin', createSelectOptions(RACE, RACE[0]));
    $professionSelect.insertAdjacentHTML('afterbegin', createSelectOptions(PROFESSION, PROFESSION[0]));
    $bannedSelect.insertAdjacentHTML('afterbegin', createSelectOptions(BANNED, BANNED[0]));
}

function fillTable(pageNumber, pageSize) {
    $.get(`rest/players?pageNumber=${pageNumber}&pageSize=${pageSize}`, (players) => {
        const $playersTableBody = $('.players-table-body')[0];
        let htmlRows = '';
        players.forEach((player) => {
            htmlRows +=
                `<tr class="table-row" data-account-id="${player.id}">
                    <td class="player-cell">${player.id}</td>
                    <td class="player-cell player-name" >${player.name}</td>
                    <td class="player-cell player-title">${player.title}</td>
                    <td class="player-cell player-race" >${player.race}</td>
                    <td class="player-cell player-profession">${player.profession}</td>
                    <td class="player-cell player-level">${player.level}</td>
                    <td class="player-cell player-birthday">${new Date(player.birthday).toLocaleDateString('uk')}</td>
                    <td class="player-cell player-banned">${player.banned}</td>
                    <td class="player-cell">
                        <button class="edit-button" value="${player.id}">
                        <img class="edit-image" src="../img/edit.png" alt="edit">
                        </button>
                    </td>
                    <td class="player-cell">
                        <button class="delete-button" value="${player.id}">
                        <img class="delete-image" src="../img/delete.png" alt="delete">
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
}

function changeActiveButton(activePageButton = 0) {
    const $paginationButtons = $('.pagination-buttons')[0];
    const $targetButton = Array.from($paginationButtons.children)[activePageButton];
    const $currentActiveButton = Array.from($paginationButtons.children)[currentPageNumber];

    $currentActiveButton.classList.remove('selected-pagination-button');
    $targetButton.classList.add('selected-pagination-button');
}

function createPlayer() {
    const data= {
        name: $('[data-create-name]').val(),
        title: $('[data-create-title]').val(),
        race: $('[data-create-race]').val(),
        profession: $('[data-create-profession]').val(),
        level: $('[data-create-level]').val(),
        birthday: new Date($('[data-create-birthday]').val()).getTime(),
        banned: $('[data-create-banned]').val(),
    }

    $.ajax({
        url: `/rest/players`,
        type: 'POST',
        data: JSON.stringify(data),
        dataType: "json",
        contentType: 'application/json',
        success: function () {
            getPlayersCount();
            fillTable(currentPageNumber, playersPerPage);
            clearFormFields();
        }
    })
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

function updatePlayer({accountId, data}) {
    $.ajax({
        url: `/rest/players/${accountId}`,
        type: 'POST',
        data: JSON.stringify(data),
        dataType: "json",
        contentType: 'application/json',
        success: function () {
            getPlayersCount();
            fillTable(currentPageNumber, playersPerPage);
        }
    })
}

function createInput(value) {
    const $htmlInputElement = document.createElement('input');

    $htmlInputElement.setAttribute('type', 'text');
    $htmlInputElement.setAttribute('value', value);
    $htmlInputElement.setAttribute('data-value', value);

    $htmlInputElement.addEventListener('input', e => {
        $htmlInputElement.setAttribute('data-value', e.currentTarget.value);
    })

    return $htmlInputElement;
}

function createSelect(optionsArray, defaultValue) {
    const $options = createSelectOptions(optionsArray, defaultValue);
    const $selectElement = document.createElement('select');

    $selectElement.insertAdjacentHTML('afterbegin', $options);
    $selectElement.setAttribute('data-value', defaultValue);
    $selectElement.addEventListener('change', e => {
        $selectElement.setAttribute('data-value', e.target.value);
    });

    return $selectElement;
}

function editAccountHandler(e) {
    const accountId = e.currentTarget.value;

    const $currentRow = $(`.table-row[data-account-id='${accountId}']`);
    const $currentImage = $currentRow.find('.edit-button img');
    const $currentDeleteButton = $currentRow.find('.delete-button');

    const $currentName = $currentRow.find('.player-name');
    const $currentRace = $currentRow.find('.player-race');
    const $currentTitle = $currentRow.find('.player-title');
    const $currentProfession = $currentRow.find('.player-profession');
    const $currentBanned = $currentRow.find('.player-banned');

    $currentImage.attr('src',"../img/save.png");
    $currentImage.on('click', () => {
        const params = {
            accountId : accountId,
            data: {
                name: $currentName.children().data('value'),
                race: $currentRace.children().data('value'),
                profession: $currentProfession.children().data('value'),
                banned: $currentBanned.children().data('value'),
                title: $currentTitle.children().data('value'),
            }
        };
        updatePlayer(params);
    });
    $currentDeleteButton.addClass('hidden');

    $currentName.html(createInput($currentName.html()));
    $currentRace.html(createSelect(RACE, $currentRace.html()));
    $currentTitle.html(createInput($currentTitle.html()));
    $currentProfession.html(createSelect(PROFESSION, $currentProfession.html()));
    $currentBanned.html(createSelect(BANNED, $currentBanned.html()));
}

function clearFormFields() {
    $('[data-create-name]').val('');
    $('[data-create-title]').val('');
    $('[data-create-race]').val('');
    $('[data-create-profession]').val('');
    $('[data-create-level]').val('');
    $('[data-create-birthday]').val('');
    $('[data-create-banned]').val('');
}