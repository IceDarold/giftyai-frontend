import { Gift } from '../../domain/types';

// Storing as Domain objects for the Mock Server simplicity, 
// but the Mock Server will return them as if they came from DB.
export const MOCK_DB_GIFTS: Gift[] = [
  // --- HIT GIFTS ---
  {
    id: '1',
    title: 'Адвент-календарь "Ритуалы красоты"',
    price: 6500,
    imageUrl: 'https://images.unsplash.com/photo-1718815628185-2ff0f9332b32?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    merchant: 'Ozon',
    productUrl: 'https://ozon.ru/search?text=advent+calendar',
    category: 'Красота',
    tags: ['новый год', 'сюрприз', 'красота', 'девушка', 'мама', 'подруга'],
    reason: 'Волшебство открывания подарка растягивается на 24 дня.',
    description: 'Роскошный набор из 24 окошек с косметическими миниатюрами, ароматическими свечами и приятными мелочами. Идеальный способ создать праздничное настроение.',
    currency: 'RUB',
    reviews: {
      rating: 4.9,
      count: 312,
      source: "Ozon",
      highlights: ["красивая упаковка", "качественное наполнение", "восторг"],
      items: [
        {
          id: 'r1', author: 'Анна', rating: 5, date: '15 дек 2023',
          text: 'Подарила сестре, она пищит от восторга каждое утро!',
          tag: 'подарок сестре',
          photos: [
            'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=400&q=60'
          ]
        }
      ]
    }
  },
  {
    id: '2',
    title: 'Умная гирлянда Twinkly (400 LED)',
    price: 13500,
    imageUrl: 'https://images.unsplash.com/photo-1575108921171-14cf38728a41?q=80&w=1035&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    merchant: 'Amazon',
    productUrl: 'https://amazon.com/s?k=twinkly',
    category: 'Технологии',
    tags: ['технологии', 'дом', 'декор', 'папа', 'семья', 'гик'],
    reason: 'Превращает елку в программируемое световое шоу.',
    description: 'Легендарная смарт-гирлянда. Через приложение можно рисовать узоры светом прямо на елке, синхронизировать с музыкой и выбирать из тысяч эффектов.',
    currency: 'RUB',
    reviews: {
      rating: 5.0,
      count: 85,
      source: "Amazon",
      highlights: ["магия", "приложение", "дорого но стоит того"],
      items: [
        {
          id: 'r2', author: 'GeekDad', rating: 5, date: '20 дек 2023',
          text: 'Лучшая игрушка для взрослых. Дети залипают на режимы часами.',
          photos: ['https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?auto=format&fit=crop&w=400&q=60']
        }
      ]
    }
  },
  {
    id: '3',
    title: 'Набор для приготовления Глинтвейна',
    price: 1800,
    imageUrl: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&w=800&q=80',
    merchant: 'WB',
    productUrl: 'https://wildberries.ru',
    category: 'Еда',
    tags: ['уют', 'еда', 'зима', 'коллега', 'друг'],
    reason: 'Ароматный и согревающий подарок для зимних вечеров.',
    description: 'Подарочный бокс: два стильных бокала, смесь премиальных специй (палочки корицы, бадьян, кардамон), сушеные апельсины и рецепт идеального напитка.',
    currency: 'RUB',
    reviews: {
      rating: 4.7,
      count: 142,
      source: "WB",
      highlights: ["аромат", "упаковка", "вкусно"],
      items: [
        {
          id: 'r3', author: 'Марина', rating: 5, date: '30 дек 2023',
          text: 'Очень атмосферный подарок. Специи свежие, аромат на всю кухню.',
          tag: 'подарок коллеге',
          photos: ['https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=60']
        }
      ]
    }
  },
  {
    id: '4',
    title: 'Фотоаппарат моментальной печати Instax',
    price: 9500,
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
    merchant: 'Ozon',
    productUrl: 'https://ozon.ru',
    category: 'Технологии',
    tags: ['технологии', 'фото', 'веселье', 'подросток', 'девушка'],
    reason: 'Чтобы запечатлеть лучшие моменты новогодней ночи на бумаге.',
    description: 'Стильный фотоаппарат в зимнем голубом цвете. Делает атмосферные карточки, которые можно сразу подарить друзьям или повесить на мудборд.',
    currency: 'RUB',
    reviews: {
      rating: 4.8,
      count: 1200,
      source: "Ozon",
      highlights: ["стильный", "качество фото", "подарок"],
      items: [
        {
          id: 'r4', author: 'Катя', rating: 5, date: '01 янв 2024',
          text: 'Лучший подарок на НГ! Нафоткались всей семьей у елки.',
          photos: [
            'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=60'
          ]
        }
      ]
    }
  },
  {
    id: '5',
    title: 'Уютный плед крупной вязки',
    price: 3500,
    imageUrl: 'https://i.etsystatic.com/25580534/r/il/6591bd/2713444075/il_fullxfull.2713444075_rouf.jpg?utm_source=chatgpt.com',
    merchant: 'WB',
    productUrl: 'https://wildberries.ru',
    category: 'Дом',
    tags: ['уют', 'дом', 'зима', 'мама', 'бабушка/дед'],
    reason: 'Максимальный уровень уюта для холодных вечеров.',
    description: 'Мягкий, объемный плед из шерсти мериноса. Идеально подходит для чтения книги с какао или просмотра новогодних фильмов.',
    currency: 'RUB',
    reviews: {
      rating: 4.6,
      count: 89,
      source: "WB",
      highlights: ["мягкий", "теплый", "красивый цвет"],
      items: [
        {
            id: 'r5', author: 'Света', rating: 5, date: '10 янв 2024',
            text: 'Кошка сразу же его оккупировала. Очень мягкий.',
            photos: ['https://images.unsplash.com/photo-1513379733131-47fc74b45fc7?auto=format&fit=crop&w=400&q=60']
        }
      ]
    }
  },
  {
    id: '6',
    title: 'Левитирующая лампа "Луна"',
    price: 8900,
    imageUrl: 'https://images.unsplash.com/photo-1585128719715-46776b56a0d1?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    merchant: 'Amazon',
    productUrl: 'https://amazon.com',
    category: 'Дом',
    tags: ['декор', 'космос', 'уют', 'гаджеты', 'парень', 'подросток'],
    reason: 'Магия магнитной левитации у вас на столе.',
    description: 'Точная 3D-копия Луны, которая парит в воздухе и вращается. Имеет несколько режимов подсветки. Выглядит завораживающе в темноте.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '7',
    title: 'Набор для Кинцуги (Ремонт золотом)',
    price: 2800,
    imageUrl: 'https://i.etsystatic.com/51892067/r/il/faee89/6616212401/il_570xN.6616212401_c38b.jpg?utm_source=chatgpt.com',
    merchant: 'Other',
    productUrl: 'https://google.com/search?q=kintsugi+kit',
    category: 'Хобби',
    tags: ['творчество', 'япония', 'эстетика', 'девушка', 'мама'],
    reason: 'Философский подарок: превращает недостатки в искусство.',
    description: 'Древнее японское искусство реставрации керамики с помощью золотого лака. В наборе все необходимое, чтобы починить любимую разбитую чашку и сделать её уникальной.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '8',
    title: 'Виниловый проигрыватель в чемодане',
    price: 7500,
    imageUrl: 'https://images.unsplash.com/photo-1526394931762-90052e97b376?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    merchant: 'Ozon',
    productUrl: 'https://ozon.ru',
    category: 'Музыка',
    tags: ['музыка', 'ретро', 'винил', 'парень', 'девушка', 'интерьер'],
    reason: 'Теплый аналоговый звук и стиль 60-х.',
    description: 'Стильный проигрыватель со встроенными динамиками и Bluetooth. Можно слушать пластинки или подключить телефон. Отлично смотрится в интерьере.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '9',
    title: 'Утяжеленное одеяло (7 кг)',
    price: 5500,
    imageUrl: 'https://images.unsplash.com/photo-1601804590276-e19ce20343da?q=80&w=1001&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    merchant: 'WB',
    productUrl: 'https://wildberries.ru',
    category: 'Дом',
    tags: ['сон', 'здоровье', 'релакс', 'стресс', 'мама', 'муж'],
    reason: 'Ощущение объятий помогает быстрее уснуть и снять тревогу.',
    description: 'Одеяло со стеклянными микрогранулами. Равномерное давление стимулирует выработку серотонина и мелатонина. Спасение от бессонницы.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '10',
    title: 'Набор для чайной церемонии Матча',
    price: 3200,
    imageUrl: 'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&w=800&q=80',
    merchant: 'Ozon',
    productUrl: 'https://ozon.ru',
    category: 'Еда',
    tags: ['зож', 'япония', 'чай', 'эстетика', 'подруга'],
    reason: 'Медитативный процесс приготовления полезного напитка.',
    description: 'В наборе: бамбуковый венчик (часен), керамическая чаша (чаван), ложечка и премиальный японский чай матча.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '11',
    title: 'Умный сад для выращивания базилика',
    price: 6900,
    imageUrl: 'https://www.mydomaine.com/thmb/dD93i7VdqUYKtKRZL5ZQG1rR0FY%3D/1499x0/filters%3Ano_upscale%28%29%3Astrip_icc%28%29/GettyImages-1270217717-7abdb7c8d429429eb3f4b5e777c149f9.jpg?utm_source=chatgpt.com',
    merchant: 'Amazon',
    productUrl: 'https://amazon.com',
    category: 'Дом',
    tags: ['кухня', 'растения', 'эко', 'мама', 'бабушка'],
    reason: 'Свежая зелень на кухне круглый год без усилий.',
    description: 'Гидропонная установка с автоматическим поливом и фитолампой. Просто вставьте капсулы с семенами, налейте воды и включите в розетку.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '12',
    title: 'Шелковая маска для сна и наволочка',
    price: 4500,
    imageUrl: 'https://www.sleepwithclementine.com/cdn/shop/files/Black-Clementine_Huda-177-Product_ccedfe12-93db-4270-9ebe-ad708f47c0b3.jpg?v=1757031731&width=720&utm_source=chatgpt.com',
    merchant: 'WB',
    productUrl: 'https://wildberries.ru',
    category: 'Красота',
    tags: ['сон', 'красота', 'уход', 'девушка', 'мама'],
    reason: 'Забота о коже и волосах даже во сне.',
    description: 'Натуральный шелк предотвращает заломы на лице и спутывание волос. Роскошный подарок в красивой коробке.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '13',
    title: 'Биокамин настольный (Огонь)',
    price: 5500,
    imageUrl: 'https://images.unsplash.com/photo-1573849420475-4f1c7bf06fa7?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    merchant: 'Amazon',
    productUrl: 'https://amazon.com',
    category: 'Дом',
    tags: ['уют', 'интерьер', 'романтика', 'семья'],
    reason: 'Живой огонь без дыма и гари в городской квартире.',
    description: 'Компактный камин на биотопливе. Создает невероятный уют, тепло и завораживающую игру огня. Безопасен для помещений.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '14',
    title: 'Световой будильник (Рассвет)',
    price: 4200,
    imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80',
    merchant: 'Ozon',
    productUrl: 'https://ozon.ru',
    category: 'Здоровье',
    tags: ['сон', 'утро', 'гаджеты', 'зима', 'коллега'],
    reason: 'Легкое пробуждение зимой, имитирующее восход солнца.',
    description: 'За 30 минут до звонка начинает плавно увеличивать яркость света от красного к желтому, помогая организму проснуться естественно.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '15',
    title: 'Мини-проектор для кино',
    price: 8000,
    imageUrl: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    merchant: 'AliExpress',
    productUrl: 'https://aliexpress.com',
    category: 'Технологии',
    tags: ['кино', 'развлечения', 'романтика', 'семья', 'студент'],
    reason: 'Кинотеатр на потолке или стене в любой комнате.',
    description: 'Портативный кубик, который проецирует изображение до 100 дюймов. Можно подключить к телефону или ноутбуку. Идеально для уютных киновечеров.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '16',
    title: 'Набор крафтового шоколада',
    price: 2500,
    imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80',
    merchant: 'Local',
    productUrl: 'https://market.yandex.ru/search?text=craft+chocolate',
    category: 'Еда',
    tags: ['сладкое', 'гурман', 'коллега', 'учитель'],
    reason: 'Гастрономическое путешествие от какао-бобов до плитки.',
    description: 'Дегустационный сет "Bean to bar". Шоколад с морской солью, лавандой, перцем чили и матчей. Без лишнего сахара и химии.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '17',
    title: 'Калимба (Музыкальный инструмент)',
    price: 1500,
    imageUrl: 'https://images.unsplash.com/photo-1671108801041-8d3c4f1bed77?q=80&w=1717&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    merchant: 'WB',
    productUrl: 'https://wildberries.ru',
    category: 'Хобби',
    tags: ['музыка', 'антистресс', 'творчество', 'дети', 'подросток'],
    reason: 'Интуитивный инструмент, на котором невозможно сыграть фальшиво.',
    description: 'Африканское "ручное пианино". Издает нежные, хрустальные звуки, похожие на музыкальную шкатулку. Успокаивает нервы.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '18',
    title: 'Увлажнитель воздуха "Пламя"',
    price: 2200,
    imageUrl: 'https://images.unsplash.com/photo-1672925216623-f32a54d732e0?q=80&w=2048&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    merchant: 'Ozon',
    productUrl: 'https://ozon.ru',
    category: 'Дом',
    tags: ['уют', 'технологии', 'дом', 'зима'],
    reason: 'Полезно для здоровья в отопительный сезон и очень красиво.',
    description: 'Увлажнитель с подсветкой пара, создающей эффект реалистичного огня. Можно добавлять аромамасла. Тихий и безопасный.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '19',
    title: 'Книга-сейф "Атлас мира"',
    price: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    merchant: 'WB',
    productUrl: 'https://wildberries.ru',
    category: 'Декор',
    tags: ['секрет', 'интерьер', 'коллега', 'мужчина'],
    reason: 'Стильный тайник для важных мелочей на книжной полке.',
    description: 'Выглядит как обычная винтажная книга, но внутри запирающийся на ключ металлический ящик. Отличный подарок с ноткой детектива.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '20',
    title: 'Набор для выращивания Бонсай',
    price: 1800,
    imageUrl: 'https://images.unsplash.com/photo-1654700216319-a67425c62499?q=80&w=1015&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    merchant: 'Ozon',
    productUrl: 'https://ozon.ru',
    category: 'Хобби',
    tags: ['растения', 'дзен', 'терпение', 'папа', 'муж'],
    reason: 'Учит терпению и созерцанию.',
    description: 'В комплекте семена японской сосны, специальный грунт, горшочек и ножницы для формирования кроны. Хобби на долгие годы.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '21',
    title: 'Гейзерная кофеварка Bialetti',
    price: 3500,
    imageUrl: 'https://first-backer.com/cdn/shop/files/CB02_8abd2914-4629-43d1-a0ca-36d92d9453d6.png?v=1762871671&utm_source=chatgpt.com',
    merchant: 'Amazon',
    productUrl: 'https://amazon.com',
    category: 'Кухня',
    tags: ['кофе', 'классика', 'именно', 'утро', 'коллега'],
    reason: 'Классика итальянского дизайна и идеальный эспрессо дома.',
    description: 'Легендарная Moka Express. Варит густой, ароматный кофе на плите. Служит десятилетиями и выглядит как арт-объект.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '22',
    title: 'Электронная книга Kindle Paperwhite',
    price: 15000,
    imageUrl: 'https://i.etsystatic.com/14970381/r/il/0027b3/4285648472/il_570xN.4285648472_49s0.jpg?utm_source=chatgpt.com',
    merchant: 'Amazon',
    productUrl: 'https://amazon.com',
    category: 'Технологии',
    tags: ['чтение', 'путешествия', 'студент', 'мама'],
    reason: 'Целая библиотека в кармане, безопасная для глаз.',
    description: 'Водонепроницаемая читалка с подсветкой. Экран выглядит как настоящая бумага. Заряда хватает на недели.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '23',
    title: 'Массажер для глаз (Smart Goggles)',
    price: 4500,
    imageUrl: 'https://www.therabody.com/cdn/shop/files/Smart-Goggles-2-Product-img-3.webp?utm_source=chatgpt.com',
    merchant: 'AliExpress',
    productUrl: 'https://aliexpress.com',
    category: 'Здоровье',
    tags: ['релакс', 'гаджеты', 'здоровье', 'программист'],
    reason: 'Спасение для тех, кто весь день за компьютером.',
    description: 'Девайс надевается как очки виртуальной реальности. Делает компрессионный массаж, греет и включает звуки природы.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '24',
    title: 'Набор для создания слепков рук',
    price: 2000,
    imageUrl: 'https://m.media-amazon.com/images/I/81QMkrb1D9L.jpg?utm_source=chatgpt.com',
    merchant: 'WB',
    productUrl: 'https://wildberries.ru',
    category: 'Хобби',
    tags: ['любовь', 'семья', 'память', 'свадьба', 'годовщина'],
    reason: 'Трогательный способ запечатлеть момент близости.',
    description: '3D-слепок переплетенных рук влюбленных или всей семьи. Очень детализированный результат, видны даже линии на ладонях.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '25',
    title: 'Столик-поднос для ванной',
    price: 2500,
    imageUrl: 'https://m.media-amazon.com/images/I/81gPjh2wjDL._AC_UF894%2C1000_QL80_.jpg?utm_source=chatgpt.com',
    merchant: 'Ozon',
    productUrl: 'https://ozon.ru',
    category: 'Дом',
    tags: ['релакс', 'ванна', 'девушка', 'жена', 'уют'],
    reason: 'Превращает обычную ванну в домашний SPA-салон.',
    description: 'Бамбуковый столик раздвигается под любую ширину ванны. Есть место для книги/планшета, бокала вина, свечи и телефона.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '26',
    title: 'Неоновая вывеска (Custom)',
    price: 4000,
    imageUrl: 'https://m.media-amazon.com/images/I/81UOzgODB8L._AC_UF894%2C1000_QL80_.jpg?utm_source=chatgpt.com',
    merchant: 'Local',
    productUrl: 'https://market.yandex.ru/search?text=neon+sign',
    category: 'Декор',
    tags: ['интерьер', 'модно', 'подросток', 'блогер'],
    reason: 'Яркий акцент для комнаты и крутой фон для фото.',
    description: 'Надпись "Do what you love" или фигура в виде молнии/сердца. Гибкий неон безопасен, не греется и создает атмосферу бара или студии.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '27',
    title: 'Ретро механическая клавиатура',
    price: 6500,
    imageUrl: 'https://m.media-amazon.com/images/I/812d-c8TXUL.jpg?utm_source=chatgpt.com',
    merchant: 'AliExpress',
    productUrl: 'https://aliexpress.com',
    category: 'Технологии',
    tags: ['компьютер', 'стиль', 'работа', 'геймер', 'писатель'],
    reason: 'Эстетика печатной машинки с современным комфортом.',
    description: 'Круглые клавиши, подсветка и приятный звук "клик-клак". Беспроводная, работает с iPad и ноутбуками. Очень фотогеничная.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '28',
    title: 'Набор для сыра с ножами',
    price: 2200,
    imageUrl: 'https://forest-decor.com/wp-content/uploads/U9-New.jpg?utm_source=chatgpt.com',
    merchant: 'Ozon',
    productUrl: 'https://ozon.ru',
    category: 'Кухня',
    tags: ['еда', 'вино', 'гости', 'новоселье'],
    reason: 'Для красивой подачи закусок, как в ресторане.',
    description: 'Доска из дуба или сланца со скрытым ящичком для специальных ножей. Незаменимая вещь для любителей вина и сыра.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '29',
    title: 'Подарочный бокс "Spa Day"',
    price: 3000,
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    merchant: 'WB',
    productUrl: 'https://wildberries.ru',
    category: 'Красота',
    tags: ['красота', 'релакс', 'девушка', 'мама', 'уют'],
    reason: 'Расслабление после предновогодней суеты.',
    description: 'Бомбочки для ванны с хвоей, соль с лавандой, скраб и мягкая повязка на голову. Упаковано в красивую коробку с лентой.',
    currency: 'RUB',
    reviews: {
      rating: 4.8,
      count: 230,
      source: "WB",
      highlights: ["запах", "упаковка", "релакс"],
      items: [
        {
          id: 'r12', author: 'Елена', rating: 5, date: '28 дек 2023',
          text: 'Маме очень понравилось! Запах на всю ванную.',
          tag: 'подарок маме',
          photos: ['https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=400&q=60']
        }
      ]
    }
  },
  {
    id: '30',
    title: 'Термокружка с дисплеем',
    price: 1200,
    imageUrl: 'https://i5.walmartimages.com/asr/86037c35-d5d6-45c3-a6d6-4bf325ffa073.02a1a8d68a60975b4599692a0b9eff36.jpeg?odnBg=FFFFFF&odnHeight=768&odnWidth=768&utm_source=chatgpt.com',
    merchant: 'Other',
    productUrl: 'https://market.yandex.ru/search?text=smart+mug',
    category: 'Кухня',
    tags: ['зима', 'кофе', 'авто', 'муж', 'папа'],
    reason: 'Горячий кофе всегда с собой, на прогулке или в машине.',
    description: 'Стильная кружка показывает температуру напитка на крышке. Держит тепло до 8 часов. Не протекает в рюкзаке.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '31',
    title: 'Набор свечей с деревянным фитилем',
    price: 1500,
    imageUrl: 'https://i.etsystatic.com/6958405/r/il/d73d3a/5411454099/il_fullxfull.5411454099_kjs8.jpg?utm_source=chatgpt.com',
    merchant: 'WB',
    productUrl: 'https://wildberries.ru',
    category: 'Дом',
    tags: ['уют', 'аромат', 'релакс', 'девушка'],
    reason: 'При горении потрескивают как дрова в камине.',
    description: 'Натуральный соевый воск и ароматы "Хвоя и мандарин", "Пряная корица". Деревянный фитиль создает уютный звук потрескивания.',
    currency: 'RUB',
     reviews: {
      rating: 4.9,
      count: 90,
      source: "WB",
      highlights: ["трещит", "запах", "уютно"],
      items: [
         {
          id: 'r20', author: 'Алина', rating: 5, date: '11 ноя 2023',
          text: 'Запах просто невероятный! Действительно трещит.',
          photos: ['https://images.unsplash.com/photo-1608754484468-6d2c6769f379?auto=format&fit=crop&w=400&q=60']
        }
      ]
    }
  },
  {
    id: '32',
    title: 'Набор для рисования по номерам (Из фото)',
    price: 2100,
    imageUrl: 'https://i.etsystatic.com/51144664/r/il/08d127/6220198117/il_570xN.6220198117_nph6.jpg?utm_source=chatgpt.com',
    merchant: 'Ozon',
    productUrl: 'https://ozon.ru',
    category: 'Хобби',
    tags: ['творчество', 'память', 'семья', 'девушка'],
    reason: 'Возможность почувствовать себя художником и нарисовать любимое фото.',
    description: 'Вы загружаете фото, а вам присылают холст с разметкой и нужные краски. Отличный способ увековечить памятный момент.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '33',
    title: 'Массажная подушка шиацу',
    price: 3500,
    imageUrl: 'https://m.media-amazon.com/images/I/71iAmm8C3uL._AC_UF1000%2C1000_QL80_.jpg?utm_source=chatgpt.com',
    merchant: 'WB',
    productUrl: 'https://wildberries.ru',
    category: 'Здоровье',
    tags: ['здоровье', 'релакс', 'родители', 'муж', 'водитель'],
    reason: 'Личный массажист для шеи и спины.',
    description: 'Ролики с подогревом глубоко разминают мышцы. Можно использовать дома, в офисе или прикрепить к сиденью автомобиля.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '34',
    title: 'Набор бармена (Шейкер и инструменты)',
    price: 2800,
    imageUrl: 'https://m.media-amazon.com/images/I/71u5Y5YBOBL._AC_UF894%2C1000_QL80_.jpg?utm_source=chatgpt.com',
    merchant: 'Ozon',
    productUrl: 'https://ozon.ru',
    category: 'Кухня',
    tags: ['вечеринка', 'коктейли', 'друзья', 'парень'],
    reason: 'Всё, чтобы делать профессиональные коктейли дома.',
    description: 'Стильный набор из нержавеющей стали на деревянной подставке. Шейкер, джиггер, мадлер и ложка. Книга рецептов в комплекте.',
    currency: 'RUB',
    reviews: undefined
  },
  {
    id: '35',
    title: 'Косметическое зеркало с подсветкой',
    price: 1900,
    imageUrl: 'https://m.media-amazon.com/images/I/810ZL4nWD8L.jpg?utm_source=chatgpt.com',
    merchant: 'WB',
    productUrl: 'https://wildberries.ru',
    category: 'Красота',
    tags: ['макияж', 'девушка', 'утро', 'блогер'],
    reason: 'Идеальный свет для макияжа в любое время суток.',
    description: 'Зеркало с регулируемой LED-подсветкой (теплый/холодный свет). Сенсорное управление. Удобно для нанесения макияжа и ухода за кожей.',
    currency: 'RUB',
    reviews: undefined
  }
];