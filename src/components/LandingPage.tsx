import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { BadgeCheck, MapPin, Users, Clock, Check, Shield, Bell, Star, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import { localizeNumber } from '../utils/numberLocalization';
// Make sure the path to your translations file is correct
// import { translations } from './translations'; // This import is not needed here if i18next is configured correctly

export default function LandingPage() {
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('appLanguage') || 'en');
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); // Hook to access translations

  // Debug logging
  console.log('Current language:', i18n.language);
  console.log('Available languages:', i18n.languages);
  console.log('Hero title translation:', t('heroTitle'));
  console.log('Current lang state:', currentLang);
  console.log('LocalStorage language:', localStorage.getItem('appLanguage'));

  // Effect to sync with i18n language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLang(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return (
    <div key={currentLang} className="min-h-screen bg-gradient-to-r from-[#e9f1fd] to-[#f2f7ff]">
      {/* Hero Section */}
      <div className="flex items-center justify-center p-8">
        <div className="max-w-7xl w-full min-h-[90vh] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Section */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              {t('heroTitle')}
            </h1>
            {/* Debug button */}
            
            <p className="text-gray-600 text-lg md:text-xl">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-wrap gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" /> {t('workersCount')}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" /> {t('citiesCount')}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" /> {t('supportText')}
              </div>
            </div>
            <div className="flex items-center justify-center mt-4 gap-4">
  {/* Label on the left */}
  <label htmlFor="language-select" className="text-gray-600 text-lg font-medium whitespace-nowrap">
    {t('Select Preferred Language')}
  </label>

  {/* Dropdown on the right */}
  <div className="relative w-full max-w-xs">
    <select
      id="language-select"
      value={currentLang}
      onChange={async (e) => {
        const newLang = e.target.value;
        console.log('Changing language to:', newLang);
        console.log('Current language before change:', i18n.language);

        // Clear any cached language data
        localStorage.removeItem('appLanguage');

        // Set the new language
        await i18n.changeLanguage(newLang);
        localStorage.setItem('appLanguage', newLang);
        setCurrentLang(newLang);

        console.log('Language changed to:', i18n.language);
        console.log('New translation for heroTitle:', t('heroTitle'));

        // Show an alert to confirm the language change
        alert(`Language changed to: ${newLang}\nHero title: ${t('heroTitle')}`);

        // Try without page reload first
        // window.location.href = window.location.href + '?t=' + Date.now();
      }}
      className="appearance-none w-full bg-gradient-to-r from-[#e9f1fd] to-[#f2f7ff] border-2 border-blue-600
                text-blue-700 px-6 py-3 pr-10 rounded-lg text-lg font-medium
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                hover:border-blue-700 hover:text-blue-800 transition-all duration-200
                cursor-pointer"
    >
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
      <option value="mr">मराठी</option>
    </select>

    {/* Custom dropdown arrow */}
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
      <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </div>
  </div>
</div>

            <Button
              className="
                w-[400px]
                bg-blue-500
                hover:bg-blue-600
                active:bg-blue-500
                text-white
                px-8 py-4
                text-lg
                font-medium
                transition-colors
                duration-200
                shadow-md
                hover:shadow-lg
                rounded-lg
            "
              onClick={() => navigate("/login")}
            >
              {t('login')}
            </Button>
          </div>
          {/* Right Section */}
          <div className="relative w-full">
            <img
              src="https://plus.unsplash.com/premium_photo-1681823749585-7dedb5a91dc6?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Workers"
              className="rounded-2xl shadow-lg w-full  h-[600px] object-cover transition-transform duration-300 hover:scale-105"
            />
            {/* Live Jobs Available */}
            <Card className="absolute top-[-20px] left-[-20px] px-5 py-3 bg-white border border-gray-200 rounded-2xl shadow-lg space-y-1">
              <div className="flex items-center text-sm text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block mr-2"></span>
                {t('liveJobsAvailable')}
              </div>
              <div className="text-blue-700 text-2xl font-semibold tracking-tight">{localizeNumber('247', i18n.language)}</div>
            </Card>
            {/* Verified Workers */}
            <Card className="absolute bottom-[-20px] right-[-20px] px-4 py-2 bg-white shadow-md border rounded-xl">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>
                {t('verifiedWorkers')}
              </div>
              <div className="text-blue-700 text-xl font-bold">{localizeNumber('8,430', i18n.language)}</div>
            </Card>
          </div>
        </div>
      </div>
      {/* Path to Success Section */}
      <div className="py-20 bg-white px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('pathTitle')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('pathSubtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Daily Wage Workers Card */}
            <Card className="p-8 hover:shadow-md transition-shadow">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('dailyWorkersTitle')}</h3>
                <p className="text-gray-600">{t('dailyWorkersSubtitle')}</p>
              </div>
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">{t('dailyPerfectFor')}</h4>
                <p className="text-gray-600">
                  {t('dailyPerfectForText')}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {t('otpLogin')}
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {t('instantConnect')}
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {t('nearbyJobs')}
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {t('dailyPay')}
                </span>
              </div>
              <div className="space-y-4 mb-8">
                <h4 className="font-medium text-gray-900">{t('dailyFeaturesTitle')}</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{t('dailyFeature1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{t('dailyFeature2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{t('dailyFeature3')}</span>
                  </li>
                </ul>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                {t('dailyGetStarted')}
              </Button>
            </Card>
            {/* Skilled Professionals Card */}
            <Card className="p-8 hover:shadow-md transition-shadow">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('skilledTitle')}</h3>
                <p className="text-gray-600">{t('skilledSubtitle')}</p>
              </div>
              <div className="mb-6 bg-green-100/70 rounded-xl p-4">
                <h4 className="font-medium text-green-800 mb-3">{t('skilledPerfectFor')}</h4>
                <p className="text-gray-600">
                  {t('skilledPerfectForText')}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="bg-green-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                  {t('skillVerification')}
                </span>
                <span className="bg-green-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                  {t('employerRatings')}
                </span>
                <span className="bg-green-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                  {t('workPortfolio')}
                </span>
                <span className="bg-green-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                  {t('verifiedBadges')}
                </span>
              </div>
              <div className="space-y-4 mb-8">
                <h4 className="font-medium text-gray-900">{t('skilledFeaturesTitle')}</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{t('skilledFeature1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{t('skilledFeature2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{t('skilledFeature3')}</span>
                  </li>
                </ul>
              </div>
              <Button variant="outline" className="w-full bg-green-600 text-white">
                {t('skilledBuildProfile')}
              </Button>
            </Card>
          </div>
        </div>
      </div>
      {/* Everything You Need to Succeed Section */}
      <div className="py-20 bg-gray-50 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('featuresTitle')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('featuresSubtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-7 mb-16">
            {/* Feature Cards */}
            <Card className="p-6 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-full bg-blue-100 transition-colors">
                  <Check className="h-5 w-5 text-blue-600 text-blue-500 transition-colors" />
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{t('otpLogin')}</h3>
              </div>
              <p className="text-gray-600">
                {t('otpLoginDescription')}
              </p>
            </Card>
            <Card className="p-6 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-full bg-green-100 transition-colors">
                  <Shield className="h-5 w-5 text-blue-600 text-green-600 transition-colors" />
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{t('securePlatform')}</h3>
              </div>
              <p className="text-gray-600">
                {t('securePlatformDescription')}
              </p>
            </Card>
            <Card className="p-6 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-full bg-blue-100 transition-colors">
                  <Navigation className="h-5 w-5 text-blue-600 text-blue-700 transition-colors" />
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{t('locationBasedJobs')}</h3>
              </div>
              <p className="text-gray-600">
                {t('locationBasedJobsDescription')}
              </p>
            </Card>
            <Card className="p-6 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-full bg-green-200 transition-colors">
                  <BadgeCheck className="h-5 w-5 text-blue-600 text-green-600 transition-colors" />
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{t('paymentTracking')}</h3>
              </div>
              <p className="text-gray-600">
                {t('paymentTrackingDescription')}
              </p>
            </Card>
            <Card className="p-6 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-full bg-yellow-100 transition-colors">
                  <BadgeCheck className="h-5 w-5 text-blue-600 text-yellow-600 transition-colors" />
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{t('skillVerification')}</h3>
              </div>
              <p className="text-gray-600">
                {t('skillVerificationDescription')}
              </p>
            </Card>
            <Card className="p-6 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-full bg-red-100 transition-colors">
                  <Bell className="h-5 w-5 text-blue-600 text-red-600 transition-colors" />
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{t('realTimeUpdates')}</h3>
              </div>
              <p className="text-gray-600">
                {t('realTimeUpdatesDescription')}
              </p>
            </Card>
            <Card className="p-6 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-full bg-indigo-100 transition-colors">
                  <Star className="h-5 w-5 text-blue-600 text-indigo-600 transition-colors" />
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{t('ratingSystem')}</h3>
              </div>
              <p className="text-gray-600">
                {t('ratingSystemDescription')}
              </p>
            </Card>
            <Card className="p-6 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-full bg-teal-100 transition-colors">
                  <Users className="h-5 w-5 text-blue-600 text-teal-600 transition-colors" />
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{t('employerNetwork')}</h3>
              </div>
              <p className="text-gray-600">
                {t('employerNetworkDescription')}
              </p>
            </Card>
          </div>
          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 space-y-1 border border-gray-300 bg-gradient-to-b from-white to-blue-40 rounded-lg">
            <div className="text-center space-y-1  p-6">
              <div className="text-4xl font-bold text-blue-500">{t('statsWorkers')}</div>
              <div className="text-gray-500 text-sm uppercase tracking-wider">{t('statsWorkersLabel')}</div>
            </div>
            <div className="text-center  p-6">
              <div className="text-4xl font-bold text-blue-500">{t('statsCities')}</div>
              <div className="text-gray-500 text-sm uppercase tracking-wider">{t('statsCitiesLabel')}</div>
            </div>
            <div className="text-center  p-6">
              <div className="text-4xl font-bold text-blue-500">{t('statsSuccessRate')}</div>
              <div className="text-gray-500 text-sm uppercase tracking-wider">{t('statsSuccessRateLabel')}</div>
            </div>
            <div className="text-center  p-6">
              <div className="text-4xl font-bold text-blue-500">{t('statsSupport')}</div>
              <div className="text-gray-500 text-sm uppercase tracking-wider">{t('statsSupportLabel')}</div>
            </div>
          </div>
        </div>
      </div>
      {/* Testimonials Section */}
      <div className="py-20 bg-white px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('testimonialsTitle')}</h2>
            <p className="text-xl text-gray-600">
              {t('testimonialsSubtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {/* Testimonial 1 */}
            <Card className="p-8 hover:shadow-md transition-shadow">
              <div className="text-orange-400 mb-4 flex">
                <Star fill="currentColor" className="w-5 h-5" />
                <Star fill="currentColor" className="w-5 h-5" />
                <Star fill="currentColor" className="w-5 h-5" />
                <Star fill="currentColor" className="w-5 h-5" />
                <Star fill="currentColor" className="w-5 h-5" />
              </div>
              <p className="text-gray-600 italic mb-6">
                "{t('testimonial1Text')}"
              </p>
              <hr />
              <div>
                <p className="font-bold text-gray-900">{t('testimonial1Name')}</p>
                <p className="text-gray-500">{t('testimonial1Role')}</p>
              </div>
            </Card>
            {/* Testimonial 2 */}
            <Card className="p-8 hover:shadow-md transition-shadow">
              <div className="text-orange-400 mb-4 flex">
                <Star fill="currentColor" className="w-5 h-5" />
                <Star fill="currentColor" className="w-5 h-5" />
                <Star fill="currentColor" className="w-5 h-5" />
                <Star fill="currentColor" className="w-5 h-5" />
                <Star fill="currentColor" className="w-5 h-5" />
              </div>
              <p className="text-gray-600 italic mb-6">
                "{t('testimonial2Text')}"
              </p>
              <hr />
              <div>
                <p className="font-bold text-gray-900">{t('testimonial2Name')}</p>
                <p className="text-gray-500">{t('testimonial2Role')}</p>
              </div>
            </Card>
            {/* Testimonial 3 */}
            <Card className="p-8 hover:shadow-md transition-shadow">
              <div className="text-orange-400 mb-4 flex">
                <Star fill="currentColor" className="w-5 h-5" />
                <Star fill="currentColor" className="w-5 h-5" />
                <Star fill="currentColor" className="w-5 h-5" />
                <Star fill="currentColor" className="w-5 h-5" />
                <Star fill="currentColor" className="w-5 h-5" />
              </div>
              <p className="text-gray-600 italic mb-6">
                "{t('testimonial3Text')}"
              </p>
              <hr />
              <div>
                <p className="font-bold text-gray-900 ">{t('testimonial3Name')}</p>
                <p className="text-gray-500">{t('testimonial3Role')}</p>
              </div>
            </Card>
          </div>
          {/* Security Section */}
          <div className="bg-gray-50 rounded-xl p-12 border border-gray-200 bg-gradient-to-b from-white to-blue-50 rounded-lg p-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('securityTitle')}</h2>
              <p className="text-xl text-gray-600">
                {t('securitySubtitle')}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 ">
              {/* Security Feature 1 */}
              <Card className="p-6 border-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 ">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">{t('securityFeature1Title')}</h3>
                </div>
                <p className="text-gray-600">
                  {t('securityFeature1Description')}
                </p>
              </Card>
              {/* Security Feature 2 */}
              <Card className="p-6 border-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 ">
                    <BadgeCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">{t('securityFeature2Title')}</h3>
                </div>
                <p className="text-gray-600">
                  {t('securityFeature2Description')}
                </p>
              </Card>
              {/* Security Feature 3 */}
              <Card className="p-6 border-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-2 ">
                    <Check className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">{t('securityFeature3Title')}</h3>
                </div>
                <p className="text-gray-600">
                  {t('securityFeature3Description')}
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-400 to-blue-600 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t('ctaTitle')}</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
            {t('ctaSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-medium">
              {t('quickJobs')}
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-medium">
              {t('professionalProfile')}
            </Button>
          </div>
          <div className="text-blue-100 mb-8">
            <p>{t('ctaFooter')}</p>
            <p className="mt-2">{t('ctaFooter2')}</p>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">{t('footerBrand')}</h3>
            <p className="text-gray-400">
              {t('footerDescription')}
            </p>
            <div className="space-y-2 text-gray-400">
              <p>{t('availableNationwide')}</p>
              <p>{t('phoneNumber')}</p>
              <p>{t('emailAddress')}</p>
            </div>
          </div>
          {/* For Workers */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">{t('forWorkers')}</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white">{t('findDailyJobs')}</a></li>
              <li><a href="#" className="hover:text-white">{t('buildYourProfile')}</a></li>
              <li><a href="#" className="hover:text-white">{t('skillVerification')}</a></li>
              <li><a href="#" className="hover:text-white">{t('paymentHistory')}</a></li>
              <li><a href="#" className="hover:text-white">{t('workerSupport')}</a></li>
            </ul>
          </div>
          {/* For Employers */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">{t('forEmployers')}</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white">{t('postJobs')}</a></li>
              <li><a href="#" className="hover:text-white">{t('findWorkers')}</a></li>
              <li><a href="#" className="hover:text-white">{t('employerDashboard')}</a></li>
              <li><a href="#" className="hover:text-white">{t('verificationServices')}</a></li>
              <li><a href="#" className="hover:text-white">{t('employerSupport')}</a></li>
            </ul>
          </div>
          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">{t('support')}</h4>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white">{t('helpCenter')}</a></li>
              <li><a href="#" className="hover:text-white">{t('safetyGuidelines')}</a></li>
              <li><a href="#" className="hover:text-white">{t('communityForum')}</a></li>
              <li><a href="#" className="hover:text-white">{t('privacyPolicy')}</a></li>
              <li><a href="#" className="hover:text-white">{t('termsOfService')}</a></li>
            </ul>
          </div>
        </div>
      </footer>
      <hr />
      {/* Newsletter Section */}
      <div className="py-16 bg-gray-900 px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t('newsletterTitle')}</h2>
          <p className="text-xl text-white mb-8">
            {t('newsletterSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="tel"
              placeholder={t('phonePlaceholder')}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 whitespace-nowrap">
              {t('subscribe')}
            </Button>
          </div>
        </div>
      </div>
      {/* Copyright */}
      <div className="py-6 bg-gray-900 text-center text-white text-sm">
        <p>{t('copyright')}</p>
      </div>
    </div>
  );
}