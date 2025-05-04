
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { availableLanguages } from '@/lib/i18n';
import { Globe } from 'lucide-react';

const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    // Save the selected language in localStorage for persistence
    localStorage.setItem('i18nextLng', lang);
  };

  const getLanguageName = (code: string) => {
    const language = availableLanguages.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  return (
    <div className="w-fit relative animate-fade-in">
      <Select
        value={i18n.language}
        onValueChange={handleLanguageChange}
      >
        <SelectTrigger className="w-[180px] border-cargomate-300 bg-white dark:bg-gray-800 text-cargomate-700 dark:text-cargomate-300 hover:border-cargomate-500 transition-colors flex items-center gap-2 shadow-md">
          <Globe className="h-4 w-4 text-cargomate-500" />
          <SelectValue placeholder={t('language.selectLanguage')} />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-gray-800 border-cargomate-300 dark:border-gray-700">
          {availableLanguages.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              className="text-cargomate-700 dark:text-cargomate-300 hover:bg-cargomate-50 dark:hover:bg-gray-700 cursor-pointer"
            >
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
