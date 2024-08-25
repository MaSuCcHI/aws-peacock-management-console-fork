# AWS Peacock Management Consoleの機能を拡張した。  
* AWS IAM Identity Centerを利用しているユーザがconfigにサブドメインを設定しておくことで開いているAWSリソースの[shortcut link](https://docs.aws.amazon.com/singlesignon/latest/userguide/createshortcutlink.html?icmpid=docs_sso_console)をピン留めしたicon<img src="./public/icons/128.png" height="20px"/>)をクリックすることで取得できます。
* 参考：https://dev.classmethod.jp/articles/iam-identity-center-shortcut-links-aws-access-portal/


## 背景
AWSのリソースのURLは、対象のAWSアカウント情報を含んでいないため、ログインしているアカウントで共有されたURLを開こうとして、別のアカウントのリソースだということが多い。 AWS IAM Identity Center ショートカットリンク作成機能を使うことでアカウント（＋閲覧ロールなど）を指定したURLを発行できるため、社内ドキュメントなどでリソースURLを埋め込む時に利用すると便利である。ショートカットリンクは簡単なルールで生成されるが、わざわざアクセスポータル画面に遷移してショートカットリンクを生成するのが面倒なためワンクリックでショートカットリンクを発行できるようにAWS Peacock Management Consoleを拡張した。  

（AWS Peacock Management Consoleを拡張したのはAWSをマルチアカウントで利用だろうとユースケースが近いため）

## config
```
{
  // AWS access portal:
  //   https://{{my_subdomain}}.awsapps.com/start/#/?tab=accounts
  "identityCenter" : "my_subdomain",
  
  "configs" : [
    /**
     * JSON with comment format
     *
     * When multiple rules match, the first matching rule will be applied.
     *
     */
    // prod
    {
      "env": {
        "account": "111111111111"
      },
      "style": {
        "navigationBackgroundColor": "#65c89b",
        "accountMenuButtonBackgroundColor": "#945bc4"
      }
    }
  ]
}

```

以下、本家README（https://github.com/xhiroga/aws-peacock-management-console）
# AWS Peacock Management Console ![Peacock](./public/icons/128.png)

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/bknjjajglapfhbdcfgmhgkgfomkkaidj.svg)](https://chrome.google.com/webstore/detail/aws-peacock-management-co/bknjjajglapfhbdcfgmhgkgfomkkaidj?utm_source=github)
[![Firefox Add-on](https://img.shields.io/amo/v/aws-extend-switch-roles3.svg)](https://addons.mozilla.org/firefox/addon/aws-peacock-management-console/)

Browser Extension to show account name or alias and change color of AWS Management Console, even if AWS SSO.

![Screenshot](images/aws-peacock-mc.png)

AWS Peacock Management Console store configuration which maps environment(Account ID and Region) to style(color). In AWS Management Console, it modify HTML tags to change color and show account alias. If logged in by AWS SSO, show account name than account name.

## Disclaimer

While effort has been made to ensure the accuracy of the program, developers assumes no responsibility for any problem caused by this extension.

## Install

- [AWS Peacock Management Console - Chrome Web Store](https://chrome.google.com/webstore/detail/aws-peacock-management-co/bknjjajglapfhbdcfgmhgkgfomkkaidj?utm_source=github)
- [AWS Peacock Management Console – 🦊 Firefox ADD-ONS](https://addons.mozilla.org/firefox/addon/aws-peacock-management-console/)

## Development

```shell
yarn
yarn watch
# Click `Load Unpacked` from chrome://extensions and select .`/dist`
```

## License

Code is provided by [LICENSE](./LICENSE). (icons are not included)  
Icons made by [Freepik](https://www.flaticon.com/authors/freepik) from [www.flaticon.com](https://www.flaticon.com/)

## References and Inspiration

- [Peacock - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=johnpapa.vscode-peacock)
- [tilfinltd/aws-extend-switch-roles: Extend your AWS IAM switching roles by Chrome extension, Firefox add-on, or Edge add-on](https://github.com/tilfinltd/aws-extend-switch-roles)
- [yaggytter/chrome-extension-awssso: Chrome Extension for AWS SSO](https://github.com/yaggytter/chrome-extension-awssso)
