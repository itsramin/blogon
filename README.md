# Blogon Setup Guide

This is a comprehensive guide to setting up and deploying the weblog platform.

---

## **فارسی (Persian)**

### **پیش‌نیازها**

- اکانت GitHub
- اکانت Vercel

### **راه‌اندازی و استقرار**

روش اصلی برای استفاده از این پلتفرم، استقرار آن بر روی Vercel است. مراحل زیر شما را در این فرآیند راهنمایی می‌کند.

#### **بخش اول: تنظیمات گیت‌هاب**

۱. **فورک کردن ریپازیتوری**
_ به ریپازیتوری پروژه بروید: [https://github.com/itsramin/blogon](https://github.com/itsramin/blogon)
_ در گوشه بالا سمت راست، روی دکمه **Fork** کلیک کنید تا یک کپی از ریپازیتوری در اکانت گیت‌هاب شما ایجاد شود.

۲. **فعال‌سازی GitHub Actions**
_ در ریپازیتوری فورک شده خود، به تب **Actions** بروید.
_ روی دکمه **I understand my workflows, go ahead and enable them** کلیک کنید.

۳. **ایجاد یک Gist در گیت‌هاب برای ذخیره‌سازی داده‌ها**
_ به آدرس [https://gist.github.com/](https://gist.github.com/) بروید.
_ در قسمت **Filename including extension...**، عبارت **`posts.xml`** را وارد کنید. این نام باید دقیقاً همین باشد. \_ در بخش محتوای فایل، ساختار XML زیر را جای‌گذاری کنید:

        ```xml
        <?xml version="1.0" encoding="UTF-8"?>
        <BLOG_DATA>
          <BLOG_INFO>
            <DOMAIN>myblog.com</DOMAIN>
            <TITLE>My Blog</TITLE>
            <SHORT_DESCRIPTION>A blog about interesting things</SHORT_DESCRIPTION>
            <FULL_DESCRIPTION>Detailed description of my blog's content and purpose</FULL_DESCRIPTION>
            <OWNER>
              <USER>
                <USER_NAME>user</USER_NAME>
                <FIRST_NAME>first name</FIRST_NAME>
                <LAST_NAME>last name</LAST_NAME>
              </USER>
            </OWNER>
          </BLOG_INFO>
          <POSTS>
          </POSTS>
        </BLOG_DATA>
        ```

- روی دکمه **Create secret gist** کلیک کنید.
- پس از ایجاد gist، **شناسه (ID) آن را از URL کپی کنید**. این شناسه، رشته طولانی از حروف و اعداد است که بعد از نام کاربری شما قرار دارد. برای مثال، در آدرس `https://gist.github.com/your-username/123abc123abc`، شناسه `123abc123abc` است. این شناسه را برای استفاده در مراحل بعدی ذخیره کنید.

۴. **ایجاد یک توکن دسترسی شخصی در گیت‌هاب (Personal Access Token)**
_ به بخش **Settings** -> **Developer settings** در اکانت گیت‌هاب خود بروید.
_ روی **Personal access tokens** و سپس **Tokens (classic)** کلیک کنید.
_ روی **Generate new token** و سپس **Generate new token (classic)** کلیک کنید.
_ یک **Note** (یادداشت) برای توکن خود بنویسید (مثلاً "Blogon").
_ قسمت **Expiration** (تاریخ انقضا) را روی **No expiration** (بدون انقضا) تنظیم کنید.
_ در بخش **Select scopes**، تیک گزینه‌های **gist** و **write:discussion** را بزنید.
_ روی **Generate token** کلیک کنید.
_ **توکن ایجاد شده را فوراً کپی کرده** و در جایی امن ذخیره کنید.

۵. **دریافت شناسه‌ی کلایت گیت‌هاب (GitHub Client ID)**
_ به بخش **Settings** -> **Developer settings** در اکانت گیت‌هاب خود بروید.
_ روی **OAuth Apps** و سپس **New OAuth App** کلیک کنید.
\_ فیلدهای زیر را پر کنید:

- **Application name**: نامی برای اپلیکیشن خود انتخاب کنید (مثلاً "Blogon").
- **Homepage URL**: آدرس وبلاگ خود را وارد کنید (مثلاً `https://your-project-name.vercel.app`).
- **Authorization callback URL**: آدرس وبلاگ خود را به همراه `/githubCallback` وارد کنید (مثلاً `https://your-project-name.vercel.app/githubCallback`). **نکته:** مسیر `/githubCallback` حیاتی است و نمی‌توان آن را تغییر داد.
  _ روی **Register application** کلیک کنید.
  _ در صفحه‌ی بعد، **Client ID** را کپی کنید و در جایی امن ذخیره کنید.

---

#### **بخش دوم: استقرار در Vercel**

۱. **ایجاد یک پروژه جدید** \_ وارد حساب کاربری خود در Vercel شوید و روی **Add New...** -> **Project** کلیک کنید.

۲. **وارد کردن ریپازیتوری فورک شده**
_ اکانت گیت‌هاب خود را به Vercel متصل کنید.
_ ریپازیتوری فورک شده `blogon` خود را در لیست پیدا کرده و روی **Import** کلیک کنید.

۳. **پیکربندی پروژه**
_ Vercel باید به طور خودکار تشخیص دهد که این یک پروژه Vite است.
_ بخش **Environment Variables** (متغیرهای محیطی) را باز کنید. شما باید چهار متغیر زیر را اضافه کنید:
_ `VITE_GISCUS_REPO`: ریپازیتوری گیت‌هاب خود را به فرمت `owner/repo` وارد کنید.
_ `VITE_GITHUB_TOKEN`: **توکن دسترسی شخصی گیت‌هاب** که ایجاد کرده بودید را اینجا جای‌گذاری کنید.
_ `VITE_GIST_ID`: **شناسه Gist** که قبلاً کپی کرده بودید را اینجا جای‌گذاری کنید.
_ `VITE_GITHUB_CLIENT_ID`: **شناسه‌ی کلایت گیت‌هاب** خود را وارد کنید. \_ روی دکمه **Deploy** کلیک کنید.

۴. **دسترسی به وبلاگ شما**
_ پس از اتمام فرآیند استقرار، Vercel یک URL به شما می‌دهد. با مراجعه به این آدرس می‌توانید وبلاگ جدید خود را ببینید.
_ برای ورود به پنل مدیریت، به آدرس `your-project-name.vercel.app` بروید و با اکانت گیت‌هاب خود وارد شوید.

---

---

## **English**

### **Prerequisites**

- A GitHub account
- A Vercel account

### **Setup and Deployment**

The primary method for using this platform is by deploying it to Vercel. The following steps will guide you through the process.

#### **Part 1: GitHub Setup**

1.  **Fork the Repository**

    - Navigate to the repository: [https://github.com/itsramin/blogon](https://github.com/itsramin/blogon)
    - Click the "**Fork**" button in the top-right corner to create a copy of the repository in your own GitHub account.

2.  **Enable GitHub Actions**

    - In your forked repository, go to the "**Actions**" tab.
    - Click the "**I understand my workflows, go ahead and enable them**" button. This will enable a workflow that keeps your fork synced with the original repository.

3.  **Create a GitHub Gist for Data Storage**

    - Go to [https://gist.github.com/](https://gist.github.com/).
    - For "**Filename including extension...**", enter **`posts.xml`**. The name must be exact.
    - In the file content area, paste the following XML structure:

      ```xml
      <?xml version="1.0" encoding="UTF-8"?>
      <BLOG_DATA>
        <BLOG_INFO>
          <DOMAIN>myblog.com</DOMAIN>
          <TITLE>My Blog</TITLE>
          <SHORT_DESCRIPTION>A blog about interesting things</SHORT_DESCRIPTION>
          <FULL_DESCRIPTION>Detailed description of my blog's content and purpose</FULL_DESCRIPTION>
          <OWNER>
            <USER>
              <USER_NAME>user</USER_NAME>
              <FIRST_NAME>first name</FIRST_NAME>
              <LAST_NAME>last name</LAST_NAME>
            </USER>
          </OWNER>
        </BLOG_INFO>
        <POSTS>
        </POSTS>
      </BLOG_DATA>
      ```

    - Click the "**Create secret gist**" button.
    - After the gist is created, **copy the ID from the URL**. The ID is the long string of characters after your username. For example, in `https://gist.github.com/your-username/123abc123abc`, the ID is `123abc123abc`. Save this ID for later.

4.  **Generate a GitHub Personal Access Token**

    - Go to your GitHub "**Settings**" -> "**Developer settings**".
    - Click on "**Personal access tokens**", then "**Tokens (classic)**".
    - Click "**Generate new token**" and select "**Generate new token (classic)**".
    - Give your token a **Note** (e.g., "Blogon").
    - Set the **Expiration** to "**No expiration**".
    - Under "**Select scopes**", check the boxes for "**gist**" and "**write:discussion**".
    - Click "**Generate token**".
    - **Copy the generated token immediately** and save it somewhere safe. You will not be able to see it again.

5.  **Get a GitHub Client ID**
    - Go to your GitHub "**Settings**" -> "**Developer settings**".
    - Click on "**OAuth Apps**", then "**New OAuth App**".
    - Fill out the following fields:
      - **Application name**: Choose a name for your application (e.g., "Blogon").
      - **Homepage URL**: Enter the URL of your blog (e.g., `https://your-project-name.vercel.app`).
      - **Authorization callback URL**: Enter the URL of your blog, with `/githubCallback` appended (e.g., `https://your-project-name.vercel.app/githubCallback`). **Note:** The `/githubCallback` path is crucial and cannot be changed.
    - Click "**Register application**".
    - On the next page, copy the **Client ID** and save it somewhere safe.

---

#### **Part 2: Vercel Deployment**

1.  **Create a New Project**

    - Log in to your Vercel account and click "**Add New...**" -> "**Project**".

2.  **Import Your Forked Repository**

    - Connect your GitHub account to Vercel.
    - Find your forked `blogon` repository in the list and click "**Import**".

3.  **Configure the Project**

    - Vercel should automatically detect that this is a Vite project.
    - Expand the "**Environment Variables**" section. You will need to add the following four variables:
      - `VITE_GISCUS_REPO`: Your GitHub repository in the format `owner/repo`.
      - `VITE_GITHUB_TOKEN`: Paste the **GitHub Personal Access Token** you generated.
      - `VITE_GIST_ID`: Paste the **Gist ID** you copied earlier.
      - `VITE_GITHUB_CLIENT_ID`: Your **GitHub Client ID**.
    - Click the "**Deploy**" button.

4.  **Access Your Blog**
    - After the deployment is complete, Vercel will provide you with a URL. You can visit this URL to see your new blog.
    - To log in to the admin panel, go to `your-project-name.vercel.app` and sign in with your GitHub account.
