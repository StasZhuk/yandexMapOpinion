import './index.css';

function mapInit() {     
    myMap = new ymaps.Map('map', {
        center: [55.76, 37.64],
        zoom: 7
    });
}

function Clusterer() {
    clusterer = new ymaps.Clusterer({
        preset: 'islands#invertedVioletClusterIcons',
        clusterDisableClickZoom: true,
        openBalloonOnClick: false
    });

    myMap.geoObjects.add(clusterer);
}

// получаем адрес при клике
function getAddres(coords) {
    return ymaps.geocode(coords).then(result => {
        let firstGeoObject = result.geoObjects.get(0).getAddressLine();
        
        return firstGeoObject;
    });
}

let myMap;
let clusterer;
let points = [];
// let geoObjects = [];


new Promise(resolve => ymaps.ready(resolve))
    .then(() => mapInit())
    .then(() => Clusterer())
    .then(() => {
        myMap.events.add('click', function (e) {

            let coords = e.get('coords');
            let addres = getAddres(coords);

            addres
                .then(pointName => {
                    let template = '<div class="opinion popover">' +
                                        '<div class="opinion__header">' +
                                            '<div class="opinion__marker"></div>' +
                                            '<div class="opinion__adress">' + pointName + '</div>' +
                                        '</div>' +
                                        '<div class="opinion__body">' +
                                            '<div class="opinion__comment-outer"><span class="no-comment">Отзывов пока нет...<span></div>' +
                                            '<div class="opinion__title">Ваш отзыв</div>' +
                                            '<div class="input-wrap">' +
                                                '<input id="" type="text" name="name" placeholder="Ваше имя">' +
                                            '</div>' +
                                            '<div class="input-wrap">' +
                                                '<input type="text" name="place" placeholder="Укажите место">' +
                                            '</div>' +
                                            '<div class="input-wrap">' +
                                                '<textarea name="comment" cols="30" rows="5" placeholder="Поделитесь впечатлениями"></textarea>' +
                                            '</div>' +
                                            '<div class="btn__wrap">' +
                                                '<div class="btn-add">Добавить</div>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>';

                    // Создание метки с пользовательским макетом балуна.
                    if (!myMap.balloon.isOpen()) {
                        myMap.balloon.open(coords, {
                            contentBody: template
                        });

                        document.body.addEventListener('click', function(e) {
                            if (e.target.classList.contains('btn-add')) {
                                let contOpinion = e.target.parentElement.parentElement.parentElement; 
                                let commentInput = e.target.parentElement.previousElementSibling.children[0];
                                let placeInput = commentInput.parentElement.previousElementSibling.children[0];
                                let nameInput = placeInput.parentElement.previousElementSibling.children[0];
                                let commentOut = nameInput.parentElement.previousElementSibling.previousElementSibling;
                                let baloonTemplate;
                                
                                if (commentInput.value !== '' && placeInput.value !== '' && nameInput.value !== '') {
                                    let obj = {
                                        name: nameInput.value,
                                        place: placeInput.value,
                                        comment: commentInput.value
                                    };
                                    let div = document.createElement('div');

                                    if (commentOut.firstElementChild.classList.contains('no-comment')) {
                                        commentOut.innerHTML = '';
                                    }

                                    div.innerHTML = `<div><span>${obj.name}</span><span> ${obj.place}</span></div><div>${obj.comment}</div>`;

                                    commentOut.appendChild(div);

                                    commentInput.value = '';
                                    placeInput.value = '';
                                    nameInput.value = '';

                                    baloonTemplate = contOpinion.outerHTML;

                                    var myPlacemark = new ymaps.Placemark(coords, {
                                        balloonContent: '<div>привет' + obj.name + '</div>'
                                    }, {
                                        balloonShadow: false,
                                        // balloonContentLayout: BalloonLayout,
                                        balloonPanelMaxMapArea: 0,
                                        // Не скрываем иконку при открытом балуне.
                                        hideIconOnBalloonOpen: false,
                                        // И дополнительно смещаем балун, для открытия над иконкой.
                                        balloonOffset: [3, -40]
                                    });
                        
                                    myMap.geoObjects.add(myPlacemark);
                                }
                            }
                        });
                        
                    } else {
                        myMap.balloon.close();
                    }
                })
        });
    })
    // .catch(() => {
    //     console.log('ошибка');
    // })