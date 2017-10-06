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
let flag = 1;
let template = '<div class="opinion__header">' +
                    '<div class="opinion__marker"></div>' +
                    '<div class="opinion__adress"></div>' +
                    '<div class="btn-exit"></div>' +
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
                '</div>';

new Promise(resolve => ymaps.ready(resolve))
    .then(() => mapInit())
    .then(() => Clusterer())
    .then(() => {
        myMap.events.add('click', function (e) {
            if (window.opinion) {
                window.opinion.parentElement.removeChild(window.opinion);

                return false;
            }
            
            let coords = e.get('coords');
            let addres = getAddres(coords);

            addres
                .then(pointName => {
                    let div = document.createElement('div');

                    div.classList.add('opinion');
                    div.setAttribute('id', 'opinion');
                    div.innerHTML = template;

                    map.appendChild(div);

                    let opinion = document.getElementById('opinion'),
                        mouseOffsetTop = e.get('pagePixels')[1],
                        mouseOffsetLeft = e.get('pagePixels')[0];
                    
                    if (opinion) {
                        opinion.style.left = mouseOffsetLeft + 'px';
                        opinion.style.top = mouseOffsetTop + 'px';
                        opinion.querySelector('.opinion__adress').innerText = pointName;

                        document.addEventListener('click', function(e) {
                            if (e.target.classList.contains('btn-add')) {
                                let commentInput = e.target.parentElement.previousElementSibling.children[0];
                                let placeInput = commentInput.parentElement.previousElementSibling.children[0];
                                let nameInput = placeInput.parentElement.previousElementSibling.children[0];
                                let commentOut = nameInput.parentElement.previousElementSibling.previousElementSibling;
                                let templateBaloon;
                                let BalloonLayout;
                                
                                if (commentInput.value !== '' && placeInput.value !== '' && nameInput.value !== '') {
                                    let obj = {
                                        name: nameInput.value,
                                        place: placeInput.value,
                                        comment: commentInput.value
                                    };
                                    let div = document.createElement('div');

                                    if (commentOut.firstElementChild.tagName == 'SPAN') {
                                        commentOut.innerHTML = '';
                                    }

                                    div.innerHTML = `<div><span>${obj.name}</span><span> ${obj.place}</span></div><div>${obj.comment}</div>`;

                                    commentOut.appendChild(div);
                                    opinion.setAttribute('id', 'opinion-' + flag);

                                    templateBaloon = opinion.outerHTML;
                                    opinion.setAttribute('id', 'opinion');
                                    
                                    window.opinion.parentElement.removeChild(window.opinion);

                                    // создаем поьзовательский макет в балуне
                                    BalloonLayout = ymaps.templateLayoutFactory.createClass(templateBaloon, {
                                        /**
                                             * Строит экземпляр макета на основе шаблона и добавляет его в родительский HTML-элемент.
                                             * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#build
                                             * @function
                                             * @name build
                                             */
                                        build: function () {
                                            this.constructor.superclass.build.call(this);
                            
                                            this._$element = $('.popover', this.getParentElement());
                            
                                            this.applyElementOffset();
                            
                                            this._$element.find('.close')
                                                .on('click', $.proxy(this.onCloseClick, this));
                                        },
                            
                                        /**
                                             * Удаляет содержимое макета из DOM.
                                             * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#clear
                                             * @function
                                             * @name clear
                                             */
                                        clear: function () {
                                            this._$element.find('.close')
                                                .off('click');
                            
                                            this.constructor.superclass.clear.call(this);
                                        },
                                        /**
                                             * Сдвигаем балун, чтобы "хвостик" указывал на точку привязки.
                                             * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
                                             * @function
                                             * @name applyElementOffset
                                             */
                                        applyElementOffset: function () {
                                            this._$element.css({
                                                left: -(this._$element[0].offsetWidth / 2),
                                                top: -(this._$element[0].offsetHeight + this._$element.find('.btn-add')[0].offsetHeight)
                                            });
                                        },
                                        /**
                                             * Используется для автопозиционирования (balloonAutoPan).
                                             * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ILayout.xml#getClientBounds
                                             * @function
                                             * @name getClientBounds
                                             * @returns {Number[][]} Координаты левого верхнего и правого нижнего углов шаблона относительно точки привязки.
                                             */
                                        getShape: function () {
                                            if(!this._isElement(this._$element)) {
                                                return BalloonLayout.superclass.getShape.call(this);
                                            }
                    
                                            var position = this._$element.position();
                    
                                            return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
                                                [position.left, position.top], [
                                                    position.left + this._$element[0].offsetWidth,
                                                    position.top + this._$element[0].offsetHeight + this._$element.find('.btn-add')[0].offsetHeight
                                                ]
                                            ]));
                                        },
                                    });
                                    
                                // Создание метки с пользовательским макетом балуна.
                                    myPlacemark = window.myPlacemark = new ymaps.Placemark(coords, {
                                        // balloonContent: '<div>Привет</div>'
                                    }, {
                                        balloonShadow: false,
                                        balloonLayout: BalloonLayout,
                                        balloonPanelMaxMapArea: 0,
                                        // Не скрываем иконку при открытом балуне.
                                        hideIconOnBalloonOpen: false,
                                        // И дополнительно смещаем балун, для открытия над иконкой.
                                        balloonOffset: [3, -40]
                                    });
                        
                                    myMap.geoObjects.add(myPlacemark);

                                    ++flag;
                                }
                            }
                        });
                    }
                })
        })
    });
    // .catch(() => {
    //     console.log('ошибка');
    // })