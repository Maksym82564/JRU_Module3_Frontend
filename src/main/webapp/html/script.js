function fillTable() {
    $.get("rest/players?", (players) => {
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
        $playersTableBody.insertAdjacentHTML("beforeend",htmlRows);
    })
}
fillTable();