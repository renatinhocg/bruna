import * as icons from '@hugeicons/core-free-icons';

const iconNames = Object.keys(icons);

console.log('=== Ícones para TESTE (Test/Lab/Science/Beaker) ===');
console.log(iconNames.filter(k => k.toLowerCase().includes('test') || k.toLowerCase().includes('lab') || k.toLowerCase().includes('science') || k.toLowerCase().includes('beaker')).slice(0, 15));

console.log('\n=== Ícones para USER simples ===');
console.log(iconNames.filter(k => k.match(/^User\d+Icon$/)).slice(0, 10));
