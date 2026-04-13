using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
using SeleniumExtras.WaitHelpers;
using Xunit;
using System;
using System.Threading;

namespace DisSagligiTakipApp.Tests
{
    public class AnasayfaTestleri : IDisposable
    {
        private IWebDriver _driver = default!;
        private WebDriverWait _wait = default!;
        
        private readonly string _baseUrl = "http://localhost:3000";
        private readonly int _stepDelay = 1000; 

        public AnasayfaTestleri()
        {
            Setup();
        }

        private void Setup()
        {
            var options = new ChromeOptions();
            options.AddArgument("--incognito");
            options.AddArgument("--disable-gpu");
            options.AddArgument("--no-sandbox");
            
            _driver = new ChromeDriver(options);
            _driver.Manage().Window.Maximize();
            _wait = new WebDriverWait(_driver, TimeSpan.FromSeconds(10));
        }

        private void WaitALittle() => Thread.Sleep(_stepDelay);

        [Fact]
        public void Kullanici_Basariyla_Giris_Yapabilmeli()
        {
            _driver.Navigate().GoToUrl($"{_baseUrl}/auth/login");
            WaitALittle();

            var emailInput = _wait.Until(ExpectedConditions.ElementIsVisible(By.Id("email1")));
            emailInput.SendKeys("Aslınehir@gmail.com");
            WaitALittle();

            _driver.FindElement(By.Id("password1")).SendKeys("AslıNehir1");
            WaitALittle();

            _driver.FindElement(By.CssSelector("button.p-button")).Click();

            _wait.Until(d => d.Url.Contains("dashboard") || d.Url == $"{_baseUrl}/");
            WaitALittle();
            
            Assert.Contains(_baseUrl, _driver.Url);
        }

        [Fact]
        public void Hatali_Sifre_Girisinde_Hata_Mesaji_Gorunmeli()
        {
            _driver.Navigate().GoToUrl($"{_baseUrl}/auth/login");
            WaitALittle();

            _wait.Until(ExpectedConditions.ElementIsVisible(By.Id("email1"))).SendKeys("Aslınehir@gmail.com");
            _driver.FindElement(By.Id("password1")).SendKeys("YanlisSifre123");
            WaitALittle();

            _driver.FindElement(By.CssSelector("button.p-button")).Click();
            
            var errorDiv = _wait.Until(ExpectedConditions.ElementIsVisible(By.ClassName("text-red-600")));
            Assert.Contains("Hatalı şifre.", errorDiv.Text);
            WaitALittle();
        }

        [Fact]
        public void Kayit_Ol_Sayfasina_Yonlendirme_Calismali()
        {
            _driver.Navigate().GoToUrl($"{_baseUrl}/auth/login");
            WaitALittle();

            var registerLink = _wait.Until(ExpectedConditions.ElementToBeClickable(By.CssSelector("a.cursor-pointer.text-primary.font-bold")));
            registerLink.Click();
            
            _wait.Until(d => d.Url.Contains("/auth/register"));
            WaitALittle();
            
            Assert.Contains("register", _driver.Url);
        }

        [Fact]
        public void Dil_Degisimi_Input_Placeholderlarini_Guncellemeli()
        {
            _driver.Navigate().GoToUrl($"{_baseUrl}/auth/login");
            WaitALittle();

            var enButton = _wait.Until(ExpectedConditions.ElementToBeClickable(By.XPath("//button[text()='EN']")));
            enButton.Click();
            WaitALittle();

            var emailInput = _driver.FindElement(By.Id("email1"));
            _wait.Until(d => emailInput.GetAttribute("placeholder") != "E-posta");
            
            Assert.NotEqual("E-posta", emailInput.GetAttribute("placeholder"));
            WaitALittle();
        }

        public void Dispose()
        {
            _driver?.Quit();
            _driver?.Dispose();
        }
    }
}