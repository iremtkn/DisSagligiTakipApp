using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
using Xunit;
using System;

namespace DisSagligiTakipApp.Tests
{
    public class AnasayfaTestleri : IDisposable
    {
        private readonly IWebDriver _driver;
        private readonly string _baseUrl = "http://localhost:3000";

        public AnasayfaTestleri()
        {
            var options = new ChromeOptions();
            options.AddArgument("--incognito"); 
            
            _driver = new ChromeDriver(options);
            _driver.Manage().Window.Maximize();
            // Genel bekleme süresi
            _driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(10);
        }

        [Fact]
        public void Kullanici_Basariyla_Giris_Yapabilmeli_Ve_Dashboard_Gormeli()
        {
            _driver.Navigate().GoToUrl($"{_baseUrl}/auth/login");

            var wait = new WebDriverWait(_driver, TimeSpan.FromSeconds(15));

            var emailInput = wait.Until(d => d.FindElement(By.Id("email1")));
            
            var passwordInput = _driver.FindElement(By.Id("password1"));
            
            var loginButton = _driver.FindElement(By.CssSelector("button.p-button"));

            emailInput.Clear();
            emailInput.SendKeys("Aslınehir@gmail.com"); 
            
            passwordInput.Clear();
            passwordInput.SendKeys("AslıNehir1");

            loginButton.Click();

            System.Threading.Thread.Sleep(5000); 
            
            bool girisBasariliMi = _driver.Url == $"{_baseUrl}/" || _driver.Url.ToLower().Contains("dashboard");
            
            Assert.True(girisBasariliMi, $"Giriş başarısız oldu veya yönlendirme gerçekleşmedi! Mevcut URL: {_driver.Url}");
        }

        public void Dispose()
        {
            _driver.Quit();
            _driver.Dispose();
        }
    }
}