 Insert Editor
================

> [Aeon Digital](http://aeondigital.com.br)
> rianna@aeondigital.com.br

Simples editor de texto web-based usando Electron


&nbsp;
&nbsp;

_______________________________________________________________________________

## Compile para o seu S/O

Instale o ``electron-packager`` usando o comando abaixo:

```bash
  npm install electron-packager -g
```

A partir de um terminal vá até o diretório onde está o código fonte de sua
aplicação e use o comando abaixo:

```bash
  electron-packager . Insert --all
```

O packager irá gerar um ou mais diretórios contendo um pacote para cada arquitetura
conhecida por ele.

IMPORTANTE:
Este packager não cria um instalador, mas sim uma versão standalone do seu
aplicativo.

OBSERVAÇÃO:
Use o comando abaixo para copiar o ícone ``icns`` para o build da plataforma ``mas``

```bash
  cp electron-insert.icns .\Insert-mas-arm64\Insert.app\Contents\Resources\electron.icns
```


Visite a [documentação oficial](https://electron.github.io/electron-packager/master/)


_______________________________________________________________________________

## Licença

Este software está licenciado sob a [Licença MIT](LICENSE).
