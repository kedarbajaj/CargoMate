
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { availableLanguages } from '@/lib/i18n';

const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="w-fit">
      <Select
        value={i18n.language}
        onValueChange={handleLanguageChange}
      >
        <SelectTrigger className="w-[180px] border-[#C07C56] bg-[#FAF3E0] text-[#6F4E37]">
          <SelectValue placeholder={t('language.selectLanguage')} />
        </SelectTrigger>
        <SelectContent className="bg-[#FAF3E0] border-[#C07C56]">
          {availableLanguages.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              className="text-[#6F4E37] hover:bg-[#C07C56] hover:text-white"
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
