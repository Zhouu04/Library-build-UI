var $ = document.querySelector.bind(document)
var $$ = document.querySelectorAll.bind(document)

const  PLAYER_STORAGE_KEY = 'F8-Player'

const header = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const playNext = $('.btn-next')
const playPrev = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom  
        this.isRepeat = this.config.isRepeat   
    },
    songs: [{
            name: 'Don\'t côi',
            singer: 'RonBoogz ft RPT Orijinn ',
            path: './assets/songs/song1.mp3',
            image: './assets/img/song1.png'
        },
        {
            name: 'Như Anh Đã Thấy Em',
            singer: 'PhucXP,FreakD',
            path: './assets/songs/song2.mp3',
            image: './assets/img/song2.png'
        },
        {
            name: 'Chuyện Rằng',
            singer: 'Thịnh Suy',
            path: './assets/songs/song3.mp3',
            image: './assets/img/song3.png'
        },
        {
            name: 'Đã Lỡ Yêu Em Nhiều',
            singer: 'Justatee',
            path: './assets/songs/song4.mp3',
            image: './assets/img/song4.png'
        },
        {
            name: 'Thủ đô cypher',
            singer: 'MCK, RPT Orijin, LowG...',
            path: './assets/songs/song5.mp3',
            image: './assets/img/song5.png'
        },
        {
            name: '3107',
            singer: 'W.nDuongg, Nâu',
            path: './assets/songs/song6.mp3',
            image: './assets/img/song6.png'
        },
        {
            name: 'Nàng Thơ',
            singer: 'Hoàng Dũng',
            path: './assets/songs/song7.mp3',
            image: './assets/img/song7.png'
        }
    ],
    render: function() {

        var htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index= ${index}>
             <div class="thumb" style="background-image: url('${song.image}')">
              </div>
              <div class="body">
               <h3 class="title">${song.name}</h3>
               <p class="author">${song.singer}</p>
              </div>
              <div class="option">
               <i class="fas fa-ellipsis-h"></i>
              </div>
            </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },
    handeEvents: function() {
        const cdW = cd.offsetWidth

        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        document.onscroll = function() {
            const scrollTop = window.scrollY
            const newCdW = cdW - scrollTop

            cd.style.width = newCdW > 0 ? newCdW + 'px' : 0
            cd.style.opacity = newCdW / cdW
        }

        playBtn.addEventListener('click', function() {
            if(app.isPlaying) {
                audio.pause()
                cdThumbAnimate.pause()
            }
            else {
                app.isPlaying = true
                audio.play()
                cdThumbAnimate.play()
            }

            audio.onplay = function() {
                app.isPlaying = true
                $('.player').classList.add('playing')
            }

            audio.onpause = function() {
                app.isPlaying =  false
                $('.player').classList.remove('playing')
                cdThumbAnimate.pause()
            }
            
            audio.ontimeupdate = function() {
                if(audio.duration) {
                    const progressPercent = Math.floor( audio.currentTime/ audio.duration *100)
                    progress.value = progressPercent
                }
            }

            progress.onchange = function(e) {
                const seekTime = audio.duration / 100 * e.target.value
                audio.currentTime = seekTime
            }

            audio.onended = function() {
                if(app.isRepeat) {
                    audio.play()
                    cdThumbAnimate.play()
                }
                else {
                    playNext.click()
                }
            }

            playlist.onclick = function(e) {
                const songNode = e.target.closest('.song:not(.active')
                if (songNode || !e.target.closest('.option')) {
                    if(songNode) {
                        app.currentIndex = Number(songNode.dataset.index)
                        app.loadCurrentSong()
                        app.render()
                        audio.play()
                        cdThumbAnimate.play()
                    }
                }
            }

        })

        playNext.addEventListener('click', function() {
            if(app.isRandom) {
                app.playRandomSong();
            }
            else {
                app.nextSong();
            }
            audio.play();
            cdThumbAnimate.play()
            app.render()
            app.scrollIntoViewSong()
        })

        playPrev.onclick = function() {
            if(app.isRandom) {
                app.playRandomSong();
            }
            else {
                app.prevSong();
            }
            audio.play();
            cdThumbAnimate.play()
            app.render()
            app.scrollIntoViewSong()

        }

        randomBtn.onclick = function() {
            app.isRandom = !app.isRandom
            app.setConfig('isRandom', app.isRandom)
            randomBtn.classList.toggle('active', app.isRandom)
        }

        repeatBtn.onclick = function() {
            app.isRepeat = !app.isRepeat
            app.setConfig('isRepeat', app.isRepeat)
            repeatBtn.classList.toggle('active', app.isRepeat)
        }
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
           get: function() {
            return this.songs[this.currentIndex]
           }
        })
    },
    scrollIntoViewSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }, 100)
    },
    loadCurrentSong: function() {
        header.textContent = this.currentSong.name
        cdThumb.style.backgroundImage= `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    nextSong: function() {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length -1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while ( newIndex === this.currentIndex)

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    
    start: function() {
        this.handeEvents(); 

        this.defineProperties();

        this.loadCurrentSong(); 

        this.render();

        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start()