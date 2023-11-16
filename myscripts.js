async function fetchPrizes() {
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const apiUrl = 'http://api.nobelprize.org/v1/prize.json';

    try {
        const response = await fetch(proxyUrl + apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data.prizes || !Array.isArray(data.prizes)) {
            console.error('Invalid data format:', data);
            return [];
        }

        return data.prizes;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
async function fetchAndDisplayData() {

    try {
        const prizes = await fetchPrizes();

        if (!prizes) {
            throw new Error('Invalid prizes data');
        }

        const selectedYear = document.getElementById('year').value;
        const selectedCategory = document.getElementById('category').value;

        const filteredPrizes = prizes.filter(prize => 
            (!selectedYear || prize.year == selectedYear) &&
            (!selectedCategory || prize.category == selectedCategory)
        );

        displayPrizes(filteredPrizes);
        displayMultipleWinners(filteredPrizes);
    } catch (error) {
        console.error('Error fetching and displaying data:', error);
    }

}


function populateFilters(prizes) {
    const yearFilter = document.getElementById('year');
    const categoryFilter = document.getElementById('category');

    const years = new Set();
    const categories = new Set();

    prizes.forEach(prize => {
        years.add(prize.year);
        categories.add(prize.category);
    });

    const filteredYears = Array.from(years).filter(year => year >= 1900 && year <= 2018);

    filteredYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.text = year;
        yearFilter.add(option);
    });

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.text = category;
        categoryFilter.add(option);
    });
}


function displayPrizes(prizes) {
    const prizesList = document.getElementById('prizes');
    prizesList.innerHTML = '';
    prizes.forEach(prize => {
        const listItem = document.createElement('li');
        listItem.className = 'prize-item';
        listItem.innerHTML = `<strong>${prize.category}</strong> (${prize.year}) - ${prize.motivation}`;

        const laureatesList = document.createElement('ul');
        prize.laureates.forEach(laureate => {
            const laureateItem = document.createElement('li');
            laureateItem.className = 'laureate-item';
            laureateItem.textContent = `${laureate.firstname} ${laureate.surname}`;
            laureatesList.appendChild(laureateItem);
        });

        listItem.appendChild(laureatesList);
        prizesList.appendChild(listItem);
    });
}


function displayMultipleWinners(prizes) {
    const multipleWinnersDiv = document.getElementById('multipleWinners');
    const multipleWinners = new Map();

    prizes.forEach(prize => {
        prize.laureates.forEach(laureate => {
            const fullName = `${laureate.firstname} ${laureate.surname}`;
            
            // If laureate is already in the map, increment their count
            if (multipleWinners.has(fullName)) {
                multipleWinners.set(fullName, multipleWinners.get(fullName) + 1);
            } else {
                multipleWinners.set(fullName, 1);
            }
        });
    });

    const winnersArray = Array.from(multipleWinners);

    // Filter laureates with count greater than 1
    const multipleWinnersArray = winnersArray.filter(([_, count]) => count > 1);

    if (multipleWinnersArray.length > 0) {
        multipleWinnersDiv.innerHTML = '<strong>People who have won the Nobel Prize more than once:</strong>';
        const multipleWinnersList = document.createElement('ul');
        multipleWinnersArray.forEach(([winner, count]) => {
            const winnerItem = document.createElement('li');
            winnerItem.textContent = `${winner} - ${count} times`;
            multipleWinnersList.appendChild(winnerItem);
        });
        multipleWinnersDiv.appendChild(multipleWinnersList);
    } else {
        multipleWinnersDiv.innerHTML = 'No laureates have won the Nobel Prize more than once.';
    }
}


async function init() {
    try {
        const prizes = await fetchPrizes();
        if (!prizes) {
            throw new Error('Invalid prizes data');
        }

        populateFilters(prizes);
        displayPrizes(prizes);
        displayMultipleWinners(prizes);

        document.getElementById('year').addEventListener('change', () => displayPrizes(prizes));
        document.getElementById('category').addEventListener('change', () => displayPrizes(prizes));
    } catch (error) {
        console.error('Error during initialization:', error);
    }
}

init();


