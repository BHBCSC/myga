 function loadNav() {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'nav.html', true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    document.body.insertAdjacentHTML('afterbegin', xhr.responseText);
                }
            };
            xhr.send();
        }
        window.onload = loadNav;