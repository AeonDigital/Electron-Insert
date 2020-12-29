 Insert Editor
================

> [Aeon Digital](http://aeondigital.com.br)
> rianna@aeondigital.com.br

Simples editor de texto web-based usando Electron


&nbsp;
&nbsp;

_______________________________________________________________________________

## Criando um pacote standalone

Instale o ``electron-packager`` usando o comando abaixo:

```bash
  npm install electron-packager -g
```

&nbsp;


A partir de um terminal vá até o diretório onde está o código fonte de sua
aplicação e use o comando abaixo:

```bash
  electron-packager . Insert --all
```

&nbsp;


O packager irá gerar um ou mais diretórios contendo um pacote para cada arquitetura
conhecida por ele.

&nbsp;
&nbsp;

__IMPORTANTE__:
Este packager não cria um instalador, mas sim uma versão standalone do seu
aplicativo.

&nbsp;

__OBSERVAÇÃO__:
Use o comando abaixo para copiar o ícone ``icns`` para o build da plataforma ``mac``

```bash
  cp electron-insert.icns .\Insert-mas-arm64\Insert.app\Contents\Resources\electron.icns
```


Visite a [documentação oficial](https://electron.github.io/electron-packager/master/)


&nbsp;
&nbsp;

_______________________________________________________________________________

## Criando um instalador

Instale o ``electron-builder`` usando o comando abaixo:

```bash
  npm install electron-builder --save-dev
```

&nbsp;


Em seu ``package.json`` adicione os seguintes scripts:

```package.json
  {
    "pack": "electron-builder --dir",
    "dist": "electron-builder"
  }
```

&nbsp;

Adicione também no ``package.json`` os seguintes valores:

```package.json
  "build": {
    "appId": "insert-editor",
    "dmg": {
      "contents": [
        {
          "x": 110,
          "y": 150
        },
        {
          "x": 240,
          "y": 150,
          "type": "link",
          "path": "/Applications"
        }
      ]
    },
    "linux": {
      "target": [
        "AppImage",
        "deb"
      ]
    },
    "win": {
      "target": "NSIS",
      "icon": "electron-insert.png"
    }
  }
```

&nbsp;

A partir de um terminal vá até o diretório onde está o código fonte de sua
aplicação e use o comando abaixo:

```bash
  npm run dist
```

_______________________________________________________________________________

## Licença

Este software está licenciado sob a [Licença MIT](LICENSE).
