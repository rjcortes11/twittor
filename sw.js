
//Imports
importScripts('js/sw-utils.js');

const STATIC_CACHE      = 'static-v4'
const DYNAMIC_CACHE     = 'dinamic-v2'
const INMUTABLE_CACHE   = 'inmutable-v1'
 
/* APP_SHELL es el corazon de la aplicacion, es lo que yo he desarrollado & lo minimo necesario*/
const APP_SHELL = [
    // '/',       ->> este solo sirve para dev
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/hulk.jpg',    
    'img/avatars/ironman.jpg',
    'img/avatars/spiderman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js',
    'js/sw-utils.js'
];

/* Son las librerias del proyecto que nunca cambiaran */
const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    "js/libs/jquery.js"
];

/* En el INSTALL se realiza el almacenamiento del cache */
self.addEventListener('install', e => {

    const cacheStatic   = caches.open( STATIC_CACHE ).then(cache => {
        cache.addAll( APP_SHELL );
    });

    const cacheInmutable = caches.open( INMUTABLE_CACHE ).then(cache => {
        cache.addAll( APP_SHELL_INMUTABLE );
    });

    e.waitUntil( Promise.all([ cacheStatic, cacheInmutable]) );
});


/* En el ACTIVATE se realiza la eliminacion del cache obsoleto */
self.addEventListener('activate', e =>{
    // eliminar el cache obsoleto (versiones anteriores)
    const respuesta = caches.keys().then( keys => {
        keys.forEach(key => {
            if( key !== STATIC_CACHE && key.includes('static') ){
                return caches.delete(key);
            }

            if( key !== DYNAMIC_CACHE && key.includes('dinamic') ){
                return caches.delete(key);
            }
        });
    })

    e.waitUntil( respuesta );
});

/* Estrategica - cache con Network Fallback */
self.addEventListener('fetch', e => {
    const respuesta = caches.match( e.request ).then( res => {
        if( res ){
            return res;
        }else{
            return fetch( e.request ).then( newRes => {
                return actualizaCacheDinamico( DYNAMIC_CACHE, e.request, newRes );
            });
        }
    });

    e.respondWith( respuesta );
});
