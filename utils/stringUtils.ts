
export const inclineName = (name: string, c: 'genitive' | 'dative'): string => {
    if (!name) return '';
    
    const lower = name.toLowerCase();
    const lastChar = lower.slice(-1);
    const preLastChar = lower.slice(-2, -1);
    const base = name.slice(0, -1);
    
    // Genitive: Кого? (для Ивана, для Марии)
    // Dative: Кому? (Ивану, Марии)

    // Имена на -а (Анна, Никита)
    if (lastChar === 'а') {
        if (c === 'genitive') return base + 'ы';
        if (c === 'dative') return base + 'е';
    }

    // Имена на -я (Мария, Ваня)
    if (lastChar === 'я') {
        // Мария -> Марии (и в род, и в дат)
        if (preLastChar === 'и') return base + 'и';
        
        if (c === 'genitive') return base + 'и';
        if (c === 'dative') return base + 'е';
    }

    // Имена на -й (Сергей, Андрей)
    if (lastChar === 'й') {
        if (c === 'genitive') return base + 'я';
        if (c === 'dative') return base + 'ю';
    }

    // Имена на -ь (Игорь, Любовь - сложно без пола, упрощаем под мужской/женский стандарт)
    if (lastChar === 'ь') {
        if (c === 'genitive') return base + 'я'; // Игорь -> Игоря
        if (c === 'dative') return base + 'ю';   // Игорь -> Игорю
    }

    // Согласная (Иван, Марк)
    // Проверка на согласную (грубая)
    if (/[бвгджзклмнпрстфхцчшщ]$/.test(lower)) {
        if (c === 'genitive') return name + 'а';
        if (c === 'dative') return name + 'у';
    }

    // Если не подошло (например, женские на согласную или оканчивающиеся на гласные у/ю/о/е)
    return name;
};
