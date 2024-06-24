async function fetchTeamLogo(teamName) {
    const encodedTeamName = encodeURIComponent(teamName);
    const apiUrl = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodedTeamName}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        // Process the response data here
        return data;
    } catch (error) {
        console.error(`Error fetching team logo for ${teamName}:`, error.message);
        return null;
    }
}



const oddsApiKey = "46e6ea667b3260541f123b5fb8f14e45";

async function fetchTeamLogo(teamName) {
    try {
        const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamName)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.teams && data.teams.length > 0) {
            const team = data.teams[0];
            return team.strTeamBadge; // Adjust based on the actual structure of the response
        } else {
            console.error('Team not found:', teamName);
            return null;
        }
    } catch (error) {
        console.error('Error fetching team logo:', error);
        return null;
    }
}

function displayMatches(matches) {
    const $matches = $('#matches');
    $matches.empty();

    const leagues = {};

    matches.forEach(match => {
        if (!leagues[match.sport_key]) {
            leagues[match.sport_key] = {
                title: match.sport_title,
                matches: []
            };
        }
        leagues[match.sport_key].matches.push(match);
    });

    Object.keys(leagues).forEach(key => {
        const league = leagues[key];

        const $leagueTable = $(`
            <div class="my-4">
                <h2>${league.title}</h2>
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th>Match</th>
                            <th>Commence Time</th>
                            <th>Bookmaker</th>
                            <th>Odds</th>
                            <th>Team Logos</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        `);

        const logoFetchPromises = league.matches.map(async match => {
            const homeTeamLogo = await fetchTeamLogo(match.home_team);
            const awayTeamLogo = await fetchTeamLogo(match.away_team);

            const $row = $(`
                <tr>
                    <td>${match.home_team} vs ${match.away_team}</td>
                    <td>${formatCommenceTime(match.commence_time)}</td>
                    <td>${match.bookmakers[0].title} (Last update: ${match.bookmakers[0].last_update})</td>
                    <td>
                        <ul class="list-unstyled">
                            ${match.bookmakers[0].markets[0].outcomes.map(outcome => `<li>${outcome.name}: ${outcome.price}</li>`).join('')}
                        </ul>
                    </td>
                    <td>
                        <img src="${homeTeamLogo}" alt="${match.home_team} logo" style="max-width: 50px;">
                        <img src="${awayTeamLogo}" alt="${match.away_team} logo" style="max-width: 50px;">
                    </td>
                </tr>
            `);

            $leagueTable.find('tbody').append($row);
        });

        Promise.all(logoFetchPromises).then(() => {
            $matches.append($leagueTable);
        });
    });
}

// Function to fetch data from the Odds API
function fetchData() {
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const apiUrl = `https://api.the-odds-api.com/v4/sports/upcoming/odds/?regions=eu&markets=h2h&apiKey=${oddsApiKey}`;

    $.ajax({
        url: proxyUrl + apiUrl,
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            displayMatches(data);
        },
        error: function(jqxhr, textStatus, error) {
            var err = textStatus + ', ' + error;
            console.log('Request Failed: ' + err);
            $('#matches').html('<p>Error loading data. Please try again later.</p>');
        }
    });
}

// Function to format commencement time
function formatCommenceTime(commenceTime) {
    const date = new Date(commenceTime);
    return date.toLocaleString();
}

// Fetch data initially
fetchData();
