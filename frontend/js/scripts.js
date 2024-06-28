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

        const $leagueContainer = $(`
            <div class="my-4">
                <h2>${league.title}</h2>
                <div class="row" id="league-${key}"></div>
            </div>
        `);

        league.matches.forEach(async match => {
            const homeTeamLogo = await fetchTeamLogo(match.home_team);
            const awayTeamLogo = await fetchTeamLogo(match.away_team);

            const $card = $(`
                <div class="col-md-4 mb-4">
                    <div class="card-sl">
                        <div class="card-heading">
                            <h5 class="card-title">${match.home_team} vs ${match.away_team}</h5>
                        </div>
                        <div class="card-body">
                            <p class="card-text"><strong>Commence Time:</strong> ${formatCommenceTime(match.commence_time)}</p>
                            <p class="card-text"><strong>Bookmaker:</strong> ${match.bookmakers[0].title} (Last update: ${match.bookmakers[0].last_update})</p>
                            <ul class="list-unstyled">
                                ${match.bookmakers[0].markets[0].outcomes.map(outcome => `<li><strong>${outcome.name}:</strong> ${outcome.price}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            `);

            $leagueContainer.find('.row').append($card);
        });

        $matches.append($leagueContainer);
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
