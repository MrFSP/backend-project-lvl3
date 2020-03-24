[![Node CI](https://github.com/MrFSP/backend-project-lvl3/workflows/Node%20CI/badge.svg)](https://github.com/MrFSP/backend-project-lvl3/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/de2c9df57d2f76475b9d/maintainability)](https://codeclimate.com/github/MrFSP/backend-project-lvl3/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/de2c9df57d2f76475b9d/test_coverage)](https://codeclimate.com/github/MrFSP/backend-project-lvl3/test_coverage)

## [Проект Загрузчик страниц](https://ru.hexlet.io/professions/backend/projects/4) / [Профессия Бэкенд JavaScript (node.js)](https://ru.hexlet.io/professions/backend)

### Уровень: 3

### Цель
Основная задача этого проекта, показать общие принципы работы 
с асинхронным кодом в js. Затрагиваемые темы:

* Тестирование с использованием Mock/Stub
* Активный файловый ввод/вывод
* Работа с ошибками и исключениями
* Знакомство с модулями nodejs: os, path, fs, url
* Работа с DOM. Базовые манипуляции
* Promises, Async/Await
* Работа с HTTP

### Описание

В рамках данного проекта необходимо реализовать утилиту для скачивания 
указанного адреса из сети. Принцип ее работы очень похож на то, что делает 
браузер при сохранении страниц сайтов.

Возможности утилиты:

* Можно указать папку, в которую нужно положить готовый файл
* Утилита скачивает все ресурсы указанные на странице и меняет страницу так, 
что начинает ссылаться на локальные версии

Пример использования:

```
$ page-loader --output /var/tmp https://hexlet.io/courses

✔ https://ru.hexlet.io/lessons.rss
✔ https://ru.hexlet.io/assets/application.css
✔ https://ru.hexlet.io/assets/favicon.ico
✔ https://ru.hexlet.io/assets/favicon-196x196.png
✔ https://ru.hexlet.io/assets/favicon-96x96.png
✔ https://ru.hexlet.io/assets/favicon-32x32.png
✔ https://ru.hexlet.io/assets/favicon-16x16.png
✔ https://ru.hexlet.io/assets/favicon-128.png

Page was downloaded as 'ru-hexlet-io-courses.html'
```

### Установка

```sh
$ make install
```

### Запуск

```sh
$ page-loader --output /var/tmp https://hexlet.io/courses
$ open /var/tmp/hexlet-io-courses.html
``` 

### Демонстрации:

#### Testing with logs

[![asciicast](https://asciinema.org/a/312987.svg)](https://asciinema.org/a/312987)
