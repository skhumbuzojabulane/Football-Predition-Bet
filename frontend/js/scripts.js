const apiKey = "46e6ea667b3260541f123b5fb8f14e45";
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const apiUrl = `https://api.the-odds-api.com/v4/sports/upcoming/odds/?regions=eu&markets=h2h&apiKey=${apiKey}`;

function formatCommenceTime(commenceTime) {
    const date = new Date(commenceTime);
    return date.toLocaleString();
}

function displayMatches(matches) {
    const $matches = $('#matches');
    $matches.empty();

    matches.forEach(match => {
        const $match = $(`
            <div class="match">
                <h2>${match.sport_title}</h2>
                <p>${formatCommenceTime(match.commence_time)}</p>
                <p>${match.home_team} vs ${match.away_team}</p>
                <h3>Odds:</h3>
                <ul class="bookmakers"></ul>
            </div>
        `);

        match.bookmakers.forEach(bookmaker => {
            const $bookmaker = $(`
                <li>
                    <strong>${bookmaker.title}</strong> (Last update: ${bookmaker.last_update})
                    <ul class="markets"></ul>
                </li>
            `);

            bookmaker.markets.forEach(market => {
                market.outcomes.forEach(outcome => {
                    const $outcome = $(`
                        <li>${outcome.name}: ${outcome.price}</li>
                    `);
                    $bookmaker.find('.markets').append($outcome);
                });
            });

            $match.find('.bookmakers').append($bookmaker);
        });

        $matches.append($match);
    });
}

// Fetch data from the API using CORS Anywhere proxy
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
