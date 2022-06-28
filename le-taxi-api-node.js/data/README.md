
The current folder data is needed to run test 'Hail fake data create ----------- Roles -----------'

During the test fake data are created then store in the data folder.

```ts
export const generatedFileName = './data/hail-fake-data-all.json';

fs.writeFileSync(generatedFileName, '');
```