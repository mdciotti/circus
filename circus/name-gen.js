'use strict'

const ANIMALS = [ // 120
    'aardvark', 'albatross', 'alligator', 'alpaca', 'ant', 'anteater', 'antelope', 'armadillo',
    'badger', 'barracuda', 'bat', 'beaver', 'bee', 'bison', 'butterfly',
    'camel', 'caribou', 'cat', 'caterpillar', 'cheetah', 'cobra', 'cod', 'coyote', 'crab', 'crane', 'crocodile', 'crow',
    'deer', 'donkey', 'dolphin', 'dove', 'dragonfly', 'duck',
    'eagle', 'eel', 'elephant', 'elk', 'emu',
    'falcon', 'ferret', 'finch', 'fish', 'flamingo', 'fox', 'frog',
    'gazelle', 'gerbil', 'giraffe', 'goat', 'goose', 'grasshopper',
    'hamster', 'hawk', 'hedgehog', 'heron', 'hornet', 'horse', 'hummingbird', 'hyena',
    'ibex',
    'jackal', 'jaguar', 'jellyfish',
    'kangaroo', 'kiwi', 'koala',
    'lemur', 'leopard', 'lion', 'llama', 'lobster', 'locust',
    'manatee', 'mole', 'mongoose', 'mouse',
    'narwhal', 'newt',
    'octopus', 'ostrich', 'otter', 'owl',
    'panther', 'parrot', 'panda', 'pelican', 'penguin', 'pigeon', 'porcupine',
    'quail',
    'rabbit', 'raccoon', 'ram', 'raven', 'reindeer', 'rhinoceros',
    'salamander', 'salmon', 'seahorse', 'seal', 'shark', 'sheep', 'sloth', 'snail', 'snake', 'spider', 'squirrel', 'swan',
    'tiger', 'toad', 'turkey', 'turtle',


    'wallaby', 'walrus', 'wasp', 'wolf', 'wolverine', 'wombat',

    'yak',
    'zebra'
]

const ADJECTIVES = [ // 116
    'adventurous', 'angry', 'annoyed', 'anxious', 'attractive', 'awesome',
    'bad', 'beaming', 'beautiful', 'brave', 'bright', 'busy',
    'charming', 'cheerful', 'confident', 'cool', 'crazy', 'creepy', 'curious', 'cute',
    'dangerous', 'dapper', 'dedicated', 'delicate', 'delightful', 'different', 'diligent', 'direct',
    'eccentric', 'ecstatic', 'elegant', 'energetic', 'euphoric', 'evil', 'excellent', 'excited', 'exuberant',
    'fast', 'fearful', 'fine', 'fluffy', 'forgetful', 'forlorn', 'friendly', 'funny',
    'glad', 'gloomy', 'good', 'grand', 'great', 'guilty',
    'happy', 'hilarious', 'huge', 'humorous',
    'intellectual', 'intelligent', 'interesting', 'intimidating',
    'jealous', 'jolly', 'jubilant',
    'kind',
    'light', 'little', 'long', 'lucky',
    'mellow', 'menacing', 'miserable',
    'nefarious', 'nice', 'noisy', 'nosy',
    'old',
    'panicked', 'peculiar', 'persnickety', 'picky', 'plain', 'playful', 'pleased', 'pretty', 'pristine',
    'quick', 'quiet',
    'radiant', 'ready', 'real', 'right',
    'sad', 'safe', 'short', 'silly', 'small', 'sneaky', 'soft', 'special', 'spontaneous', 'spotted', 'strange', 'strong', 'sure', 'surprised',
    'tall', 'terrified', 'tiny', 'tired', 'tough', 'true',
    'uplifting',
    'victorious',
    'warm', 'wild',

    'young',
    'zany'
]

function *NameGenerator() {
    let pool = new Set()

    let animal_count = ANIMALS.length
    let adjective_count = ADJECTIVES.length
    console.log(ADJECTIVES.length)
    let name, animal, adjective

    while (true) {
        do {
            animal = ANIMALS[Math.floor(animal_count * Math.random())]
            animal = animal[0].toUpperCase() + animal.slice(1)
            adjective = ADJECTIVES[Math.floor(adjective_count * Math.random())]
            adjective = adjective[0].toUpperCase() + adjective.slice(1)
            name = adjective + animal
        } while (pool.has(name))
        pool.add(name)
        yield name
    }
}

module.exports = NameGenerator
