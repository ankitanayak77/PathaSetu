export const SUPPORTED_CLASSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const SUPPORTED_BOARDS = [
  { id: 'BSE_ODISHA', label: 'BSE Odisha / OSEPA (Odia & Bilingual Medium)', portal: 'https://osepa.odisha.gov.in/' },
  { id: 'CBSE', label: 'CBSE / NCERT (e-Pathshala National Syllabus)', portal: 'https://ncert.nic.in/textbook.php' },
  { id: 'ICSE', label: 'CISCE / ICSE (Council Syllabus)', portal: 'https://cisce.org/' },
  { id: 'OTHER_STATE', label: 'State Board Bridge (WBBSE / BSEAP / State)', portal: 'https://diksha.gov.in/' }
];

// Unverified prototype content. These records are drafts and must not be represented as a verified syllabus or textbook corpus.
export const CURRICULUM_SYLLABUS = {
  1: {
    'Odia (ଭାଷା · ହସଖୁସି)': [
      {
        id: 'c1_or_ch1',
        title: 'ଅକ୍ଷର ଓ ମାତ୍ରା ପରିଚୟ (Letters & Vowel Matras)',
        odiaTitle: 'ଅକ୍ଷର ଓ ମାତ୍ରା ପରିଚୟ',
        bookTitle: 'OSEPA ହସଖୁସି (Hasakhusi Class-I)',
        ncertCode: 'aulh101',
        summaryOr: 'ଓଡ଼ିଆ ବର୍ଣ୍ଣମାଳାରେ ସ୍ୱରବର୍ଣ୍ଣ (ଅ, ଆ, ଇ, ଈ...) ଓ ବ୍ୟଞ୍ଜନ ବର୍ଣ୍ଣ (କ, ଖ, ଗ...) ସହିତ ଆ-କାର (ା), ଇ-କାର (ି) ମାତ୍ରାର ବ୍ୟବହାର ।',
        summaryEn: 'Recognition of Odia vowels (Swarabarna), consonants (Byanjanabarna), and vowel diacritics (Matras) used to build foundational words.',
        formula: 'ବ୍ୟଞ୍ଜନ + ସ୍ୱର ମାତ୍ରା = ପୂର୍ଣ୍ଣ ଅକ୍ଷର (e.g., କ୍ + ଆ = କା)',
        bridge: { everydayOr: 'ଆବାଜ / ଅକ୍ଷର ଚିହ୍ନ', schoolOr: 'ସ୍ୱରବର୍ଣ୍ଣ ଓ ମାତ୍ରା', en: 'Vowel & Diacritic Sign' },
        sampleQ: {
          promptOr: '‘କ’ ଅକ୍ଷର ସହିତ ‘ଆ’ ମାତ୍ରା (ା) ମିଶିଲେ କେଉଁ ଅକ୍ଷର ଗଠିତ ହୁଏ?',
          promptEn: 'When the consonant "କ (ka)" combines with the vowel sign "ା (aa-kara)", which syllable is formed?',
          options: [
            { id: 'A', textOr: 'କା (Kaa)', textEn: 'କା (Kaa — Correct Matra attachment)' },
            { id: 'B', textOr: 'କି (Ki)', textEn: 'କି (Ki — Uses short i-matra instead of aa-matra)' },
            { id: 'C', textOr: 'କୁ (Ku)', textEn: 'କୁ (Ku — Uses u-matra below the letter)' },
            { id: 'D', textOr: 'କେ (Ke)', textEn: 'କେ (Ke — Uses e-matra before the letter)' }
          ],
          correctOptionId: 'A',
          explanationOr: '‘କ’ ସହିତ ଆ-କାର (ା) যোগ ହେଲେ ‘କା’ ହୁଏ (ଯଥା: କାମ, କାଳି) ।',
          explanationEn: 'Adding the aa-kara (ା) vowel sign to କ produces କା (Kaa).'
        }
      },
      {
        id: 'c1_or_ch2',
        title: 'ସରଳ ଶବ୍ଦ ଓ ବାକ୍ୟ ଗଠନ (Simple Words & Sentences)',
        odiaTitle: 'ସରଳ ଶବ୍ଦ ଓ ବାକ୍ୟ ଗଠନ',
        bookTitle: 'OSEPA ହସଖୁସି (Hasakhusi Class-I)',
        ncertCode: 'aulh102',
        summaryOr: 'ଦୁଇ ଓ ତିନି ଅକ୍ଷର ବିଶିଷ୍ଟ ସରଳ ଓଡ଼ିଆ ଶବ୍ଦ (ଘର, ଜଳ, କമଳ, ବହି) ଏବଂ ଛୋଟ ବାକ୍ୟ ପଠନ ।',
        summaryEn: 'Building two- and three-letter uncompounded Odia words and reading simple subject-object-verb sentences.',
        formula: 'କର୍ତ୍ତା (Subject) + କର୍ମ (Object) + କ୍ରିୟା (Verb)',
        bridge: { everydayOr: 'କଥା ପଦ', schoolOr: 'ସରଳ ବାକ୍ୟ', en: 'Simple Sentence' },
        sampleQ: {
          promptOr: 'ନିମ୍ନলিখିତ ମଧ୍ୟରୁ କେଉଁଟି ଗୋଟିଏ ଅର୍ଥପୂର୍ଣ୍ଣ ତିନି-ଅକ୍ଷର ଓଡ଼ିଆ ଶବ୍ଦ?',
          promptEn: 'Which of the following forms a meaningful three-letter Odia word meaning "Lotus"?',
          options: [
            { id: 'A', textOr: 'କମଳ (Kamala)', textEn: 'କମଳ (Kamala — Lotus)' },
            { id: 'B', textOr: 'ଳମକ (Lamaka)', textEn: 'ଳମକ (Scrambled letter order)' },
            { id: 'C', textOr: 'ମଳକ (Malaka)', textEn: 'ମଳକ (Reversed root order)' },
            { id: 'D', textOr: 'କଳମ (Kalama — Pen)', textEn: 'କଳମ (Means Pen, not Lotus)' }
          ],
          correctOptionId: 'A',
          explanationOr: '‘କ-ମ-ଳ’ ମିଶିଲେ ‘କମଳ’ (পদ্ম ଫୁଲ) ଶବ୍ଦ ହୁଏ ।',
          explanationEn: 'କ + ମ + ଳ in sequence forms କମଳ (Lotus).'
        }
      }
    ],
    'Mathematics (ଗଣିତ ଖେଳ)': [
      {
        id: 'c1_ma_ch1',
        title: 'Numbers 1 to 20 & Counting Objects (୧ ରୁ ୨୦ ଗଣନା)',
        odiaTitle: '୧ ରୁ ୨୦ ସଂଖ୍ୟା ଓ ଗଣନା',
        bookTitle: 'OSEPA ହସଖୁସି ଗଣିତ / NCERT Joyful Mathematics Class-I',
        ncertCode: 'aejm101',
        summaryOr: '୧ ରୁ ୨୦ ପର୍ଯ୍ୟନ୍ତ ସଂଖ୍ୟା ଚିହ୍ନିବା, ବସ୍ତୁ ଗଣିବା ଏବଂ ୧୦ ର ଗୋଟିଏ ବିଡ଼ା (ଦଶକ) ବୁଝିବା ।',
        summaryEn: 'Counting concrete objects from 1 to 20, comparing more vs. less, and bundling 10 ones into 1 ten.',
        formula: '1 Ten (୧ ଦଶକ) + 4 Ones (୪ ଏକକ) = 14 (୧୪)',
        bridge: { everydayOr: 'ଦଶଟିର ବିଡ଼ା', schoolOr: 'ଦଶକ ଓ ଏକକ', en: 'Tens and Ones' },
        sampleQ: {
          promptOr: '୧ ଗୋଟି ଦଶକ ବିଡ଼ା (10) ଏବଂ ୫ ଟି ଖୋଲା କାଠି (5) ମିଶିଲେ ମୋଟ କେତେ ହେବ?',
          promptEn: 'If you have 1 bundle of ten sticks (10) and 5 loose sticks (5), what is the total number of sticks?',
          options: [
            { id: 'A', textOr: '୧୫ (15)', textEn: '15 (1 Ten + 5 Ones = 15)' },
            { id: 'B', textOr: '୫୧ (51)', textEn: '51 (Swapped Tens and Ones place)' },
            { id: 'C', textOr: '୬ (6)', textEn: '6 (Added 1 + 5 ignoring the bundle of ten)' },
            { id: 'D', textOr: '୧୦୫ (105)', textEn: '105 (Wrote 10 and 5 side by side without place value)' }
          ],
          correctOptionId: 'A',
          explanationOr: '୧ ଦଶକ (୧୦) + ୫ ଏକକ (୫) = ୧୫ (15) । ୧ + ୫ = ୬ କରିବା ଭୁଲ୍ ଅଟେ ।',
          explanationEn: '1 bundle of ten is 10, plus 5 ones equals 15. Writing 6 forgets that the bundle represents 10.'
        }
      }
    ],
    'Joyful EVS (ପରିବେଶ)': [
      {
        id: 'c1_ev_ch1',
        title: 'Plants, Trees & Animals Around Us (ଆମ ଚାରିପାଖର ଜୀବଜନ୍ତୁ)',
        odiaTitle: 'ଆମ ଚାରିପାଖର ଗଛଲତା ଓ ଜୀବଜନ୍ତୁ',
        bookTitle: 'OSEPA ପରିବେଶ ଅଧ୍ୟୟନ Class-I',
        ncertCode: 'aeev101',
        summaryOr: 'ଆମ ଚାରିପାଖରେ ଥିବା ଗଛଲତା, ପଶୁପକ୍ଷୀ ଏବଂ ସେମାନଙ୍କର ଖାଦ୍ୟ ଓ ବାସସ୍ଥାନ ।',
        summaryEn: 'Observing local plants, domestic and wild animals, and understanding how living things need water and food.',
        formula: 'ଜୀବ (Living) = ଖାଦ୍ୟ + ଜଳ + ବାୟୁ ଆବଶ୍ୟକ କରେ',
        bridge: { everydayOr: 'ଗୃହପାଳିତ ପଶୁ', schoolOr: 'ପୋଷା ପ୍ରାଣୀ', en: 'Domestic Animals' },
        sampleQ: {
          promptOr: 'ଗଛ ବଞ୍ଚିବା ଓ ବଢ଼ିବା ପାଇଁ କ’ଣ ନିହାତି ଦରକାର?',
          promptEn: 'What does a plant need to stay alive and grow?',
          options: [
            { id: 'A', textOr: 'ଜଳ, ବାୟୁ ଓ ସୂର୍ଯ୍ୟାଲୋକ', textEn: 'Water, air, and sunlight' },
            { id: 'B', textOr: 'କେବଳ ପ୍ଲାଷ୍ଟିକ୍ ପାତ୍ର', textEn: 'Only a plastic pot without water' },
            { id: 'C', textOr: 'ଅନ୍ଧାର ଘର ଓ ବନ୍ଦ ବାକ୍ସ', textEn: 'A completely dark closed box' },
            { id: 'D', textOr: 'କୌଣସି ଜଳ ଦରକାର ନାହିଁ', textEn: 'No water or air is needed' }
          ],
          correctOptionId: 'A',
          explanationOr: 'ଗଛଲତା ବଢ଼ିବା ପାଇଁ ଜଳ, ବାୟୁ ଓ ସୂର୍ଯ୍ୟକିରଣ ଆବଶ୍ୟକ କରନ୍ତି ।',
          explanationEn: 'Plants are living things and require water, air, and sunlight to grow.'
        }
      }
    ]
  },
  2: {
    'Mathematics (ଗଣିତ)': [
      {
        id: 'c2_ma_ch1',
        title: 'Two-Digit Place Value & Addition (ଦଶକ ଓ ଏକକ ସ୍ଥାନୀୟ ମାନ)',
        odiaTitle: 'ଦଶକ ଓ ଏକକ ସ୍ଥାନୀୟ ମାନ',
        bookTitle: 'OSEPA ହସଖୁସି ଗଣିତ Class-II / NCERT Joyful Math-II',
        ncertCode: 'bejm102',
        summaryOr: 'ଦୁଇ-ଅଙ୍କ ସଂଖ୍ୟାରେ ଦଶକ ଓ ଏକକର ସ୍ଥାନୀୟ ମାନ ଏବଂ ହାସିଲ ମିଶାଣ ।',
        summaryEn: 'Place value of two-digit numbers up to 99 and regrouping 10 ones into 1 ten during addition.',
        formula: '47 = 4 Tens (୪୦) + 7 Ones (୭)',
        bridge: { everydayOr: 'ହାସିଲ ନେବା', schoolOr: 'ଦଶକ ପୁନଃ-ସମୂହীকରଣ', en: 'Regrouping / Carrying' },
        sampleQ: {
          promptOr: '୪୭ (47) ସଂଖ୍ୟାରେ ‘୪’ ର ସ୍ଥାନୀୟ ମାନ (Place Value) କେତେ?',
          promptEn: 'In the two-digit number 47, what is the place value of the digit 4?',
          options: [
            { id: 'A', textOr: '୪୦ (40 · ଚାରି ଦଶକ)', textEn: '40 (4 Tens)' },
            { id: 'B', textOr: '୪ (4 · କେବଳ ଅଙ୍କ ମାନ)', textEn: '4 (Confused face value with place value)' },
            { id: 'C', textOr: '୭୦ (70)', textEn: '70 (Used the ones digit in tens place)' },
            { id: 'D', textOr: '୧୧ (4 + 7)', textEn: '11 (Added the two digits together)' }
          ],
          correctOptionId: 'A',
          explanationOr: '୪୭ ରେ ୪ ଦଶକ ସ୍ଥାନରେ ଥିବାରୁ ଏହାର ସ୍ଥାନୀୟ ମାନ ୪ × ୧୦ = ୪୦ ଅଟେ ।',
          explanationEn: 'In 47, the digit 4 is in the tens place, so its place value is 4 × 10 = 40.'
        }
      }
    ]
  },
  3: {
    'Environmental Studies (ଆମ ପରିବେଶ)': [
      {
        id: 'c3_ev_ch1',
        title: 'Living & Non-Living Things (ଜୀବ ଓ ନିର୍ଜୀବ ବସ୍ତୁ)',
        odiaTitle: 'ଜୀବ ଓ ନିର୍ଜୀବ ବସ୍ତୁ',
        bookTitle: 'OSEPA ଆମ ପରିବେଶ Class-III / NCERT Looking Around-III',
        ncertCode: 'ceap101',
        summaryOr: 'ଜୀବମାନେ ଖାଦ୍ୟ ଖାଆନ୍ତି, ଶ୍ୱାସକ୍ରିୟା କରନ୍ତି ଓ ବଢ଼ନ୍ତି; ନିର୍ଜୀବ ବସ୍ତୁ (ପଥର, ଟେବୁଲ) ଏହା କରନ୍ତି ନାହିଁ ।',
        summaryEn: 'Distinguishing living organisms (growth, respiration, reproduction) from non-living objects.',
        formula: 'ଜୀବ = ଶ୍ୱସନ + ବୃଦ୍ଧି + ପ୍ରଜନନ',
        bridge: { everydayOr: 'ନିଶ୍ୱାସ ନେବା', schoolOr: 'ଶ୍ୱାସକ୍ରିୟା', en: 'Respiration / Breathing' },
        sampleQ: {
          promptOr: 'ମେଘ ଆକାଶରେ ଗୋଟିଏ ସ୍ଥାନରୁ ଅନ୍ୟ ସ୍ଥାନକୁ ଗତି କରେ, ତଥାପି ଏହା ‘ନିର୍ଜୀବ’ କାହିଁକି?',
          promptEn: 'A cloud moves across the sky, yet why is it classified as non-living (ନିର୍ଜୀବ)?',
          options: [
            { id: 'A', textOr: 'ମେଘ ପବନ ଦ୍ୱାରା ଚାଲେ; ଏହା ଶ୍ୱାସକ୍ରିୟା କିମ୍ବା ପ୍ରଜନନ କରେ ନାହିଁ', textEn: 'It is pushed by wind and does not respire, eat, or reproduce' },
            { id: 'B', textOr: 'ଯାହା ଗତି କରେ ତାହା ସବୁବେଳେ ଜୀବ ଅଟେ', textEn: 'Anything that moves is automatically alive' },
            { id: 'C', textOr: 'ମେଘ ଖାଦ୍ୟ ଖାଏ କିନ୍ତୁ ଆମକୁ ଦେଖାଯାଏ ନାହିଁ', textEn: 'Clouds eat food invisibly' },
            { id: 'D', textOr: 'ମେଘ କେବଳ ରାତିରେ ଜୀବନ୍ତ ହୁଏ', textEn: 'Clouds become living at night' }
          ],
          correctOptionId: 'A',
          explanationOr: 'କେବଳ ବାହ୍ୟ ବଳ (ପବନ) ଦ୍ୱାରା ଗତି କଲେ ବସ୍ତୁ ଜୀବ ହୁଏ ନାହିଁ; ଜୀବ ହେବା ପାଇଁ ଶ୍ୱସନ ଓ ଜୈବିକ ବୃଦ୍ଧି ଦରକାର ।',
          explanationEn: 'Movement caused by external wind does not make an object alive; clouds do not respire or reproduce.'
        }
      }
    ],
    'Mathematics (ଗଣିତ ମଞ୍ଜରୀ)': [
      {
        id: 'c3_ma_ch1',
        title: '3-Digit Numbers, Multiplication & Division (ଗୁଣନ ଓ ହରଣ)',
        odiaTitle: '୩-ଅଙ୍କ ସଂଖ୍ୟା, ଗୁଣନ ଓ ହରଣ',
        bookTitle: 'OSEPA ଗଣିତ ମଞ୍ଜରୀ Class-III',
        ncertCode: 'cemm103',
        summaryOr: 'ପୁନଃପୁନଃ ମିଶାଣ ହିଁ ଗୁଣନ (Repeated addition is multiplication) ଏବଂ ସମାନ ଭାଗ କରିବା ହିଁ ହରଣ ।',
        summaryEn: 'Understanding multiplication as repeated addition of equal groups and division as equal sharing.',
        formula: '4 + 4 + 4 = 3 × 4 = 12',
        bridge: { everydayOr: 'ସମାନ ଭାଗ କରିବା', schoolOr: 'ହରଣ ପ୍ରକ୍ରିୟା', en: 'Division as Equal Sharing' },
        sampleQ: {
          promptOr: 'ଯଦି ଗୋଟିଏ ଥାଳିରେ ୫ ଟି ଆମ୍ବ ଅଛି, ତେବେ ୪ ଟି ଥାଳିରେ ମୋଟ କେତୋଟି ଆମ୍ବ ରହିବ?',
          promptEn: 'If 1 plate holds 5 mangoes, how many mangoes are on 4 plates altogether?',
          options: [
            { id: 'A', textOr: '୨୦ ଟି (4 × 5 = 20)', textEn: '20 mangoes (4 groups of 5 = 4 × 5 = 20)' },
            { id: 'B', textOr: '୯ ଟି (4 + 5 = 9)', textEn: '9 mangoes (Added 4 + 5 instead of multiplying equal groups)' },
            { id: 'C', textOr: '୧ ଟି (5 - 4 = 1)', textEn: '1 mango (Subtracted 5 - 4)' },
            { id: 'D', textOr: '୪୫ ଟି (45)', textEn: '45 mangoes (Concatenated digits 4 and 5)' }
          ],
          correctOptionId: 'A',
          explanationOr: '୪ ଟି ଥାଳିରେ ୫ ଟି ଲେଖାଏଁ ଆମ୍ବ ଅର୍ଥାତ୍ ୫ + ୫ + ୫ + ୫ = ୪ × ୫ = ୨୦ ଟି ଆମ୍ବ ।',
          explanationEn: '4 equal groups of 5 is 5 + 5 + 5 + 5 = 4 × 5 = 20.'
        }
      }
    ]
  },
  4: {
    'Mathematics (ଗଣିତ)': [
      {
        id: 'c4_ma_ch1',
        title: 'Factors, Multiples & Basic Fractions (ଭଗ୍ନାଂଶ ପରିଚୟ)',
        odiaTitle: 'ଗୁଣନୀୟକ, ଗୁଣିତକ ଓ ଭଗ୍ନାଂଶ',
        bookTitle: 'OSEPA ଗଣିତ Class-IV / NCERT Math-Magic IV',
        ncertCode: 'demh109',
        summaryOr: 'ଗୋଟିଏ ପୂର୍ଣ୍ଣ ବସ୍ତୁକୁ ସମାନ ଭାଗ କଲେ ପ୍ରତ୍ୟେକ ଭାଗକୁ ଭଗ୍ନାଂଶ (ଲବ / ହର) କୁହାଯାଏ ।',
        summaryEn: 'Representing equal parts of a whole as a fraction (Numerator / Denominator) and comparing unit fractions.',
        formula: 'Fraction (ଭଗ୍ନାଂଶ) = ଲବ (Numerator) / ହର (Denominator)',
        bridge: { everydayOr: 'ଚାରି ଭାଗରୁ এক ଭାଗ', schoolOr: 'ଏକ-ଚତୁର୍ଥାଂଶ (1/4)', en: 'One-Fourth (Quarter)' },
        sampleQ: {
          promptOr: 'ଗୋଟିଏ ରୁଟିକୁ ୨ ଜଣଙ୍କ ମଧ୍ୟରେ ସମାନ ଭାଗ କଲେ (1/2) ବଡ଼ ହେବ ନା ୪ ଜଣଙ୍କ ମଧ୍ୟରେ ସମାନ ଭାଗ କଲେ (1/4) ଗୋଟିଏ ଖଣ୍ଡ ବଡ଼ ହେବ?',
          promptEn: 'Which piece is larger: 1/2 of a roti (shared equally between 2 people) or 1/4 of the same roti (shared among 4 people)?',
          options: [
            { id: 'A', textOr: '1/2 ବଡ଼ ଅଟେ (কম ଭାଗ ହେলে ପ୍ରତ୍ୟେକ ଖଣ୍ଡ ବଡ଼ ହୁଏ)', textEn: '1/2 is larger (fewer equal parts means each piece is bigger)' },
            { id: 'B', textOr: '1/4 ବଡ଼ ଅଟେ (କାରଣ 4 ସଂଖ୍ୟାଟି 2 ଠାରୁ ବଡ଼)', textEn: '1/4 is larger because 4 > 2 (Whole-number denominator misconception)' },
            { id: 'C', textOr: 'ଉଭୟ ସମାନ ଅଟେ', textEn: 'Both 1/2 and 1/4 are equal' },
            { id: 'D', textOr: 'କେଉଁଟି ନୁହେଁ', textEn: 'Cannot be compared' }
          ],
          correctOptionId: 'A',
          explanationOr: 'ଲବ ସମାନ ଥିଲେ ହର ଯେତେ ଛୋଟ ହୁଏ ଭଗ୍ନାଂଶର ମାନ ସେତେ ବଡ଼ ହୁଏ; ତେଣୁ 1/2 > 1/4 ।',
          explanationEn: 'When the whole is divided into 2 equal parts (1/2), each piece is twice as large as when divided into 4 parts (1/4).'
        }
      }
    ]
  },
  5: {
    'Mathematics (ଗଣିତ ଧାରା)': [
      {
        id: 'c5_ma_ch1',
        title: 'HCF, LCM, Decimals & Fractions (ଗ.ସା.ଗୁ, ଲ.ସା.ଗୁ ଓ ଦଶମିକ)',
        odiaTitle: 'ଗ.ସା.ଗୁ, ଲ.ସା.ଗୁ ଓ ଦଶମିକ',
        bookTitle: 'OSEPA ଗଣିତ ଧାରା Class-V',
        ncertCode: 'eemh106',
        summaryOr: 'ଦଶମିକ ସଂଖ୍ୟାରେ ଦଶାଂଶ (1/10 = 0.1) ଓ ଶତାଂଶ (1/100 = 0.01) ର ତୁଳନା ।',
        summaryEn: 'Comparing decimal numbers using tenths (0.1) and hundredths (0.01) place value.',
        formula: '0.5 = 5/10 = 50/100 > 0.25 (25/100)',
        bridge: { everydayOr: 'ଦଶ ଭାଗରୁ ପାଞ୍ଚ ଭାଗ', schoolOr: 'ଦଶମିକ ପାଞ୍ଚ (0.5)', en: 'Five Tenths (0.5)' },
        sampleQ: {
          promptOr: '୦.୫ (0.5) ଏବଂ ୦.୨୫ (0.25) ମଧ୍ୟରୁ କେଉଁ ଦଶମିକ ସଂଖ୍ୟାଟି ବଡ଼?',
          promptEn: 'Which decimal number is greater: 0.5 or 0.25?',
          options: [
            { id: 'A', textOr: '0.5 ବଡ଼ ଅଟେ (କାରଣ 0.5 = 0.50 > 0.25)', textEn: '0.5 is greater (5 tenths = 50 hundredths > 25 hundredths)' },
            { id: 'B', textOr: '0.25 ବଡ଼ ଅଟେ (କାରଣ ୨୫ ସଂଖ୍ୟାଟି ୫ ଠାରୁ ବଡ଼)', textEn: '0.25 is greater because 25 > 5 (Longer-decimal misconception)' },
            { id: 'C', textOr: 'ଉଭୟ ସମାନ', textEn: 'Both are equal' },
            { id: 'D', textOr: '0.5 ର ମାନ 0.05 ଅଟେ', textEn: '0.5 equals 0.05' }
          ],
          correctOptionId: 'A',
          explanationOr: '0.5 ରେ 5 ଟି ଦଶାଂଶ (0.50) ଅଛି, କିନ୍ତୁ 0.25 ରେ କେବଳ 2 ଟି ଦଶାଂଶ ଓ 5 ଟି ଶତାଂଶ ଅଛି; ତେଣୁ 0.5 > 0.25 ।',
          explanationEn: 'Compare the tenths place first: 0.5 has 5 tenths (0.50), whereas 0.25 has 2 tenths. Thus 0.5 > 0.25.'
        }
      }
    ],
    'Environmental Studies (ଆମ ପରିବେଶ ବିଜ୍ଞାନ ଓ ସାମାଜିକ)': [
      {
        id: 'c5_ev_ch1',
        title: 'States of Matter, Force & Simple Machines (ପଦାର୍ଥ, ବଳ ଓ ସରଳ ଯନ୍ତ୍ର)',
        odiaTitle: 'ପଦାର୍ଥର ଅବସ୍ଥା, ବଳ ଓ ସରଳ ଯନ୍ତ୍ର',
        bookTitle: 'OSEPA ଆମ ପରିବେଶ ବିଜ୍ଞାନ Class-V',
        ncertCode: 'eeap105',
        summaryOr: 'କଠିନ, ତରଳ ଓ ଗ୍ୟାସୀୟ ଅବସ୍ଥା ଏବଂ ସରଳ ଯନ୍ତ୍ର (ଉତ୍ତୋଳକ, ଆନତ ତଳ, କପିଳୀ) ସାହାଯ୍ୟରେ କମ୍ ବଳରେ କାର୍ଯ୍ୟ ।',
        summaryEn: 'Solids, liquids, and gases; how simple machines (levers, pulleys, inclined planes) make work easier.',
        formula: 'ଉତ୍ତୋଳକ (Lever): ଆଲମ୍ବ (Fulcrum) + ଭାର (Load) + ପ୍ରୟାସ (Effort)',
        bridge: { everydayOr: 'ଶାବଳରେ ପଥର ଉଠାଇବା', schoolOr: 'ପ୍ରଥମ ଶ୍ରେଣୀ ଉତ୍ତୋଳକ', en: 'First-Class Lever' },
        sampleQ: {
          promptOr: 'ଗୋଟିଏ ଭାରୀ ବାକ୍ସକୁ ସିଧା ଉପରକୁ ଟେକିବା ଅପେକ୍ଷା ଗୋଟିଏ ଢାଲୁ ପଟା (Inclined Plane) ଉପରେ ঠେଲି ଚଢ଼ାଇବା ସହଜ କାହିଁକି?',
          promptEn: 'Why is pushing a heavy box up a sloping ramp (inclined plane) easier than lifting it straight up?',
          options: [
            { id: 'A', textOr: 'ଢାଲୁ ପଟା ଦୂରତା ବଢ଼ାଇ ଦିଏ କିନ୍ତୁ ଆବଶ୍ୟକ ବଳ (Effort) କମାଇ ଦିଏ', textEn: 'The ramp increases the distance moved but reduces the effort force needed at any moment' },
            { id: 'B', textOr: 'ଢାଲୁ ପଟା ବାକ୍ସର ଓଜନ ଶୂନ କରିଦିଏ', textEn: 'The ramp makes the mass of the box disappear' },
            { id: 'C', textOr: 'ଢାଲୁ ପଟା ମହାକର୍ଷଣ ବଳକୁ ବନ୍ଦ କରିଦିଏ', textEn: 'The ramp switches off gravity' },
            { id: 'D', textOr: 'ସିଧା ଟେକିବାରେ କମ୍ ବଳ ଲାଗେ', textEn: 'Lifting straight up takes less force' }
          ],
          correctOptionId: 'A',
          explanationOr: 'ଆନତ ତଳ (Inclined Plane) ଗୋଟିଏ ସରଳ ଯନ୍ତ୍ର ଯାହା ଅଧିକ ଦୂରତା ଦେଇ କମ୍ ପ୍ରୟାସ ବଳରେ ଭାର ଉଠାଇବାରେ ସାହାଯ୍ୟ କରେ ।',
          explanationEn: 'An inclined plane spreads the work over a longer distance, requiring less effort force at a time.'
        }
      }
    ]
  },
  6: {
    'General Science (ବିଜ୍ଞାନ)': [
      {
        id: 'c6_sc_ch2',
        title: 'Electricity & Simple Torch Circuits (ବିଦ୍ୟୁତ୍ ଓ ସରଳ ଟର୍ଚ୍ଚ ପରିପଥ)',
        odiaTitle: 'ବିଦ୍ୟୁତ୍ ଓ ସରଳ ଟର୍ଚ୍ଚ ପରିପଥ',
        bookTitle: 'BSE Odisha ବିଜ୍ଞାନ Class-VI / NCERT Curiosity Class-VI',
        ncertCode: 'fesc109',
        summaryOr: 'ବିଦ୍ୟୁତ୍ ସେଲ୍‌ର ଦୁଇଟି ମେରୁ (+ ଓ -) ଏବଂ ବଲ୍‌ব ଜଳିବା ପାଇଁ ଗୋଟିଏ ସମ୍ପୂର୍ଣ୍ଣ ବନ୍ଦ ପରିପଥ ଆବଶ୍ୟକ ।',
        summaryEn: 'A dry cell has positive (+) and negative (-) terminals; a torch bulb glows only when connected in a complete closed loop between both terminals.',
        formula: 'Closed Loop: Cell (+) → Conducting Wire → Bulb Filament → Cell (-)',
        bridge: { everydayOr: 'ସୁଇଚ୍ ଦେବା / ଲାଇଟ୍ ଜଳିବା', schoolOr: 'ବନ୍ଦ ବିଦ୍ୟୁତ୍ ପରିପଥ', en: 'Closed Electric Circuit' },
        sampleQ: {
          promptOr: 'ଯଦି ବଲ୍‌ବର ଦୁଇଟି ତାରକୁ ବିଦ୍ୟୁତ୍ ସେଲ୍‌ର କେବଳ ଗୋଟିଏ ମେରୁ (+) ସହିତ ଯୋଡ଼ାଯାଏ, ତେବେ ବଲ୍‌ବ ଜଳିବ କି?',
          promptEn: 'If both wires from a torch bulb are connected only to the positive (+) terminal of a cell, will the bulb glow?',
          options: [
            { id: 'A', textOr: 'ଜଳିବ ନାହିଁ, କାରଣ (+) ଓ (-) ଉଭୟ ମେରୁ ମଧ୍ୟରେ ବନ୍ଦ ପଥ ନାହିଁ', textEn: 'No, because a complete path between the (+) and (-) terminals is missing' },
            { id: 'B', textOr: 'ଜଳିବ, କାରଣ ଧନାତ୍ମକ ମେରୁରେ ସବୁ ଶକ୍ତି ଥାଏ', textEn: 'Yes, because all energy sits at the positive terminal alone (Unipolar misconception)' },
            { id: 'C', textOr: 'ଅর্ধେକ ଆଲୋକ ଦେବ', textEn: 'It will glow at half brightness' },
            { id: 'D', textOr: 'ବଲ୍‌ବ ଫ୍ୟୁଜ୍ ହୋଇଯିବ', textEn: 'The bulb filament will melt immediately' }
          ],
          correctOptionId: 'A',
          explanationOr: 'ବିଦ୍ୟୁତ୍ ପ୍ରବାହ ପାଇଁ ସେଲ୍‌ର ଧନାତ୍ମକ (+) ମେରୁରୁ ଋଣାତ୍ମକ (-) ମେରୁ ପର୍ଯ୍ୟନ୍ତ ସମ୍ପୂର୍ଣ୍ଣ ବନ୍ଦ ପରିପଥ ଦରକାର ।',
          explanationEn: 'Current flows only when there is a potential difference across a closed path connecting both (+) and (-) terminals.'
        }
      },
      {
        id: 'c6_sc_ch1',
        title: 'Sources of Food & Components of Nutrition (ଖାଦ୍ୟ ଓ ପୋଷକ ତତ୍ତ୍ୱ)',
        odiaTitle: 'ଖାଦ୍ୟର ଉତ୍ସ ଓ ପୋଷକ ତତ୍ତ୍ୱ',
        bookTitle: 'BSE Odisha ବିଜ୍ଞାନ Class-VI / NCERT Class-VI',
        ncertCode: 'fesc101',
        summaryOr: 'ଶ୍ୱେତସାର, ପୁଷ୍ଟିସାର, ସ୍ନେହସାର, ଭିଟାମିନ୍ ଓ ଖଣିଜ ଲବଣ ଆମ ଶରୀରକୁ ଶକ୍ତି ଓ ବୃଦ୍ଧି ଦିଅନ୍ତି ।',
        summaryEn: 'Carbohydrates, proteins, fats, vitamins, and minerals form a balanced diet; iodine tests for starch.',
        formula: 'Starch (मंड/ଶ୍ୱେତସାର) + Dilute Iodine → Blue-Black Colour (ନୀଳ-କଳା ରଙ୍ଗ)',
        bridge: { everydayOr: 'ଭାତ / ଆଳୁ ର ଶକ୍ତି', schoolOr: 'ଶ୍ୱେତସାର (Carbohydrate)', en: 'Starch / Carbohydrate' },
        sampleQ: {
          promptOr: 'କଟା ଆଳୁ ଉପରେ ୨ ବୁନ୍ଦା ଲଘୁ ଆୟୋଡିନ୍ ଦ୍ରବଣ ପକାଇଲେ ଏହାର ରଙ୍ଗ ନୀଳ-କଳା (Blue-black) ହେବା କ’ଣ ଦର୍ଶାଏ?',
          promptEn: 'When dilute iodine solution turns a slice of potato blue-black, what nutrient does it confirm?',
          options: [
            { id: 'A', textOr: 'ଶ୍ୱେତସାର ବା ମଣ୍ଡଦ (Starch) ର ଉପସ୍ଥିତି', textEn: 'Presence of Starch (Carbohydrate)' },
            { id: 'B', textOr: 'ପୁଷ୍ଟିସାର (Protein) ର ଉପସ୍ଥିତି', textEn: 'Presence of Protein (tested with copper sulphate + caustic soda)' },
            { id: 'C', textOr: 'ସ୍ନେହସାର (Fat) ର ଉପସ୍ଥିତି', textEn: 'Presence of Fat' },
            { id: 'D', textOr: 'କେବଳ ଜଳର ଉପସ୍ଥିତି', textEn: 'Presence of water only' }
          ],
          correctOptionId: 'A',
          explanationOr: 'ଆୟୋଡିନ୍ ଦ୍ରବଣ ମଣ୍ଡଦ (Starch / ଶ୍ୱେତସାର) ସହିତ ମିଶି ନୀଳ-କଳା ରଙ୍ଗ ଦିଏ ।',
          explanationEn: 'A blue-black colour with iodine solution is the standard test confirming starch (carbohydrate).'
        }
      }
    ],
    'Mathematics (ଗଣିତ)': [
      {
        id: 'c6_ma_ch1',
        title: 'Integers & Algebraic Expressions (ପୂର୍ଣ୍ଣ ସଂଖ୍ୟା ଓ ବୀଜଗଣିତ)',
        odiaTitle: 'ପୂର୍ଣ୍ଣ ସଂଖ୍ୟା ଓ ବୀଜଗଣିତ ପରିଚୟ',
        bookTitle: 'BSE Odisha ଗଣିତ Class-VI / NCERT Ganita Prakash-VI',
        ncertCode: 'femh106',
        summaryOr: 'ସଂଖ୍ୟାରେଖାରେ ଧନାତ୍ମକ (+) ଓ ଋଣାତ୍ମକ (-) ପୂର୍ଣ୍ଣ ସଂଖ୍ୟାମାନଙ୍କର ତୁଳନା ଓ ଯୋଗ-ବିୟୋଗ ।',
        summaryEn: 'Ordering positive and negative integers on the number line and adding/subtracting directed numbers.',
        formula: 'On number line: -2 is to the right of -5, so -2 > -5',
        bridge: { everydayOr: 'ଶୂନ ତଳକୁ ଥଣ୍ଡା / ଋଣ', schoolOr: 'ଋଣାତ୍ମକ ପୂର୍ଣ୍ଣ ସଂଖ୍ୟା', en: 'Negative Integer' },
        sampleQ: {
          promptOr: 'ସଂଖ୍ୟାରେଖାରେ -୨ (-2) ଏବଂ -୫ (-5) ମଧ୍ୟରୁ କେଉଁ ପୂର୍ଣ୍ଣ ସଂଖ୍ୟାଟି ବଡ଼?',
          promptEn: 'On the number line, which integer is greater: -2 or -5?',
          options: [
            { id: 'A', textOr: '-୨ ବଡ଼ ଅଟେ (କାରଣ ସଂଖ୍ୟାରେଖାରେ -୨, -୫ ର ଡାହାଣ ପଟେ ଅଛି)', textEn: '-2 is greater (it lies to the right of -5 on the number line)' },
            { id: 'B', textOr: '-୫ ବଡ଼ ଅଟେ (କାରଣ ୫ > ୨)', textEn: '-5 is greater because 5 > 2 (Magnitude-only misconception)' },
            { id: 'C', textOr: 'ଉଭୟ ସମାନ', textEn: 'Both are equal' },
            { id: 'D', textOr: 'ଋଣାତ୍ମକ ସଂଖ୍ୟା ତୁଳନା କରିହୁଏ ନାହିଁ', textEn: 'Negative integers cannot be ordered' }
          ],
          correctOptionId: 'A',
          explanationOr: 'ସଂଖ୍ୟାରେଖାରେ ଯେଉଁ ସଂଖ୍ୟା ଡାହାଣ ପଟେ ଥାଏ ତାହା ବଡ଼; -2, -5 ର ଡାହାଣରେ ଥିବାରୁ -2 > -5 ।',
          explanationEn: 'Numbers increase from left to right on the number line; since -2 is to the right of -5, -2 > -5.'
        }
      }
    ]
  },
  7: {
    'General Science (ବିଜ୍ଞାନ)': [
      {
        id: 'c7_sc_ch1',
        title: 'Heat, Temperature & Modes of Transfer (ତାପ ଓ ତାପମାତ୍ରା)',
        odiaTitle: 'ତାପ, ତାପମାତ୍ରା ଓ ତାପ ସଞ୍ଚାରଣ',
        bookTitle: 'BSE Odisha ବିଜ୍ଞାନ Class-VII / NCERT Science-VII',
        ncertCode: 'gesc103',
        summaryOr: 'ତାପ ସର୍ବଦା অধিক ତାପମାତ୍ରା ଥିବା ବସ୍ତୁରୁ କମ୍ ତାପମାତ୍ରା ଥିବା ବସ୍ତୁକୁ ପରିବହନ, পরিচଳନ ବା ବିକିରଣ ଦ୍ୱାରା ପ୍ରବାହିତ ହୁଏ ।',
        summaryEn: 'Heat flows from a body at higher temperature to lower temperature via conduction, convection, or radiation; woollen clothes trap insulating air.',
        formula: 'Heat Flow: High Temp (T₁) → Low Temp (T₂) until Thermal Equilibrium',
        bridge: { everydayOr: 'ଶୀତବସ୍ତ୍ର ଗରମ ଲାଗିବା', schoolOr: 'ତାପ କୁପରିବାହୀ ବାୟୁ', en: 'Thermal Insulation' },
        sampleQ: {
          promptOr: 'ଶୀତଦିନେ ଗୋଟିଏ ମୋଟା କମ୍ବଳ ଘୋଡ଼ି ହେବା ଅପେକ୍ଷା ଦୁଇଟି ପତଳା କମ୍ବଳ ଏକାଠି ଘୋଡ଼ି ହେଲେ ଅଧିକ ଉଷୁମ ଲାଗେ କାହିଁକି?',
          promptEn: 'Why do two thin blankets joined together keep you warmer in winter than one thick blanket of the same total thickness?',
          options: [
            { id: 'A', textOr: 'ଦୁଇଟି କମ୍ବଳ ମଝିରେ ଥିବା ବାୟୁ ସ୍ତର ତାପ କୁପରିବାହୀ ଭାବେ ଶରୀରର ତାପ ବାହାରକୁ ଯିବାକୁ ଦିଏ ନାହିଁ', textEn: 'The layer of air trapped between the two blankets acts as a thermal insulator preventing heat loss' },
            { id: 'B', textOr: 'କମ୍ବଳ ନିଜେ ନୂତନ ତାପ ସୃଷ୍ଟି କରେ', textEn: 'Blankets actively generate heat energy on their own (Sweater-generates-heat misconception)' },
            { id: 'C', textOr: 'ପତଳା କମ୍ବଳ ଥଣ୍ଡାକୁ ଶୋଷି ନିଏ', textEn: 'Thin blankets absorb coldness particles' },
            { id: 'D', textOr: 'ଗୋଟିଏ ମୋଟା କମ୍ବଳ ସବୁବେଳେ ଅଧିକ ଗରମ ଦିଏ', textEn: 'One thick blanket is always warmer' }
          ],
          correctOptionId: 'A',
          explanationOr: 'ବାୟୁ ତାପର କୁପରିବାହୀ (Insulator) ଅଟେ; ଦୁଇଟି କମ୍ବଳ ମଝିରେ ଆବଦ୍ଧ ବାୟୁ ଶରୀରର ତାପକୁ ବାହାରକୁ ଯିବାରେ ବାଧା ଦିଏ ।',
          explanationEn: 'Blankets do not create heat; the air trapped between two layers is a poor conductor of heat and reduces heat transfer from your body.'
        }
      }
    ]
  },
  8: {
    'General Science (ବିଜ୍ଞାନ)': [
      {
        id: 'c8_sc_ch1',
        title: 'Force, Friction & Pressure (ବଳ, ଘର୍ଷଣ ଓ ଚାପ)',
        odiaTitle: 'ବଳ, ଘର୍ଷଣ ଓ ଚାପ',
        bookTitle: 'BSE Odisha ବିଜ୍ଞାନ Class-VIII / NCERT Science-VIII',
        ncertCode: 'hesc108',
        summaryOr: 'ଏକକ କ୍ଷେତ୍ରଫଳ ଉପରେ ଲମ୍ବ ଭାବରେ କାର୍ଯ୍ୟ କରୁଥିବା ବଳକୁ ଚାପ (Pressure = Force / Area) କୁହାଯାଏ ।',
        summaryEn: 'Pressure is the force acting perpendicularly per unit area (P = F / A); smaller contact area produces larger pressure for the same force.',
        formula: 'P = F / A (Pa = N / m²)',
        bridge: { everydayOr: 'ଚଉଡ଼ା ବ୍ୟାଗ୍ ଫିତା କାନ୍ଧକୁ ନ କାଟିବା', schoolOr: 'କ୍ଷେତ୍ରଫଳ ବଢ଼ିଲେ ଚାପ କମେ (P = F/A)', en: 'Pressure Inversely Proportional to Area' },
        sampleQ: {
          promptOr: 'ସ୍କୁଲ୍ ବ୍ୟାଗ୍‌ର ଫିତା (Strap) ପତଳା ନ କରି ଚଉଡ଼ା କରାଯାଏ କାହିଁକି?',
          promptEn: 'Why are school bag shoulder straps made wide rather than thin?',
          options: [
            { id: 'A', textOr: 'ଫିତା ଚଉଡ଼ା ହେଲେ କ୍ଷେତ୍ରଫଳ (A) ବଢ଼େ, ଫଳରେ କାନ୍ଧ ଉପରେ ଚାପ (P = F/A) କମିଯାଏ', textEn: 'A wider strap increases the contact area A, which reduces the pressure P = F / A on the shoulder' },
            { id: 'B', textOr: 'ଚଉଡ଼ା ଫିତା ବ୍ୟାଗ୍‌ର ଓଜନ ( ବଳ F ) କମାଇ ଦିଏ', textEn: 'A wider strap reduces the total gravitational weight F of the books (Force-vs-Pressure misconception)' },
            { id: 'C', textOr: 'ଚଉଡ଼ା ଫିତା ଚାପ ବଢ଼ାଇ ଦିଏ', textEn: 'A wider strap increases pressure on the shoulder' },
            { id: 'D', textOr: 'ଏହା କେବଳ ସୁନ୍ଦର ଦେଖାଯିବା ପାଇଁ', textEn: 'It is purely decorative' }
          ],
          correctOptionId: 'A',
          explanationOr: 'ଚାପ P = F / A; ବ୍ୟାଗ୍‌ର ଓଜନ (F) ସମାନ ରହିଲେ ମଧ୍ୟ କ୍ଷେତ୍ରଫଳ (A) ବଢ଼ିলে ଚାପ (P) କମିଯାଏ ।',
          explanationEn: 'Since Pressure = Force / Area, increasing the strap area A spreads the same weight F over a larger area, reducing pressure.'
        }
      }
    ]
  },
  9: {
    'Physical Science (ଭୌତିକ ବିଜ୍ଞାନ)': [
      {
        id: 'c9_ps_ch2',
        title: 'Motion, Laws of Motion & Gravitation (ଗତି, ନିଉଟନ୍‌ଙ୍କ ଗତି ନିୟମ ଓ ମହାକର୍ଷଣ)',
        odiaTitle: 'ଗତି, ନିଉଟନ୍‌ଙ୍କ ଗତି ନିୟମ ଓ ମହାକର୍ଷଣ',
        bookTitle: 'BSE Odisha ଭୌତିକ ବିଜ୍ଞାନ Class-IX / NCERT Science-IX',
        ncertCode: 'iesc108',
        summaryOr: 'ବস্তୁର ଜଡ଼ତା (Inertia) ତାହାର ବସ୍ତୁତ୍ୱ (Mass) ଉପରେ ନିର୍ଭର କରେ; F = m × a ଏବଂ କ୍ରିୟା ଓ ପ୍ରତିକ୍ରିୟା ବଳ ଦୁଇଟି ଭିନ୍ନ ବସ୍ତୁ ଉପରେ କାର୍ଯ୍ୟ କରେ ।',
        summaryEn: 'Newton’s three laws of motion: inertia depends on mass, net force F = ma, and action-reaction forces act on two different bodies.',
        formula: 'F_net = m × a | p = m × v | F_AB = -F_BA',
        bridge: { everydayOr: 'ବସ୍ ହଠାତ୍ ଅଟକିଲେ ଆଗକୁ ଝୁଙ୍କି ପଡ଼ିବା', schoolOr: 'ଗତି ଜଡ଼ତା (Inertia of Motion)', en: 'Inertia of Motion (Newton’s First Law)' },
        sampleQ: {
          promptOr: 'ଚାଲୁଥିବା ବସ୍ ହଠାତ୍ ବ୍ରେକ୍ ମାରିଲେ ଯାତ୍ରୀମାନେ ଆଗକୁ ଝୁଙ୍କି ପଡ଼ନ୍ତି କାହିଁକି?',
          promptEn: 'When a moving bus brakes suddenly, why do passengers lurch forward?',
          options: [
            { id: 'A', textOr: 'ଗତି ଜଡ଼ତା (Inertia of motion) ଯୋଗୁଁ ଶରୀରର ଉପର ଭାଗ ଗତିଶୀଳ ଅବସ୍ଥା ବଜାୟ ରଖିବାକୁ ଚାହେଁ', textEn: 'Due to inertia of motion, the upper body continues moving forward while the feet stop with the bus floor' },
            { id: 'B', textOr: 'ବ्रेକ୍ ଯାତ୍ରୀଙ୍କୁ ଆଗକୁ ଗୋଟିଏ ନୂଆ ବଳରେ ଠେଲି ଦିଏ', textEn: 'The brakes apply a forward pushing force on the passengers (Forward-impetus misconception)' },
            { id: 'C', textOr: 'ବସ୍ ଭିତରେ ମହାକର୍ଷଣ ବଳ ବଢ଼ିଯାଏ', textEn: 'Gravity suddenly pulls forward inside the bus' },
            { id: 'D', textOr: 'ସ୍ଥିତି ଜଡ଼ତା ଯୋଗୁଁ', textEn: 'Due to inertia of rest' }
          ],
          correctOptionId: 'A',
          explanationOr: 'ନିଉଟନ୍‌ଙ୍କ ପ୍ରଥମ ଗତି ନିୟମ ଅନୁଯାୟୀ, ଗୋଡ଼ ବସ୍ ଚଟାଣ ସହ ଅଟକି ଯାଏ କିନ୍ତୁ ଗତି ଜଡ଼ତା ଯୋଗୁଁ ଶରୀରର ଉପର ଭାଗ ଆଗକୁ ଗତି ଜାରି ରଖେ ।',
          explanationEn: 'By Newton’s First Law, no forward force pushes the passenger; their upper body simply maintains its forward velocity (inertia of motion).'
        }
      }
    ]
  },
  10: {
    'Physical Science (ଭୌତିକ ବିଜ୍ଞାନ)': [
      {
        id: 'electricity',
        title: 'Electricity (ବିଦ୍ୟୁତ୍ · Closed Circuits, Ohms Law, Series/Parallel, Heating)',
        odiaTitle: 'ବିଦ୍ୟୁତ୍ (ପରିପଥ, ଓମ୍‌ଙ୍କ ନିୟମ ଓ ବିଦ୍ୟୁତ୍ ଶକ୍ତି)',
        bookTitle: 'BSE Odisha ଭୌତିକ ବିଜ୍ଞାନ Class-X / NCERT Science-X Ch.11',
        ncertCode: 'jesc111',
        summaryOr: 'ବନ୍ଦ ପରିପଥରେ ବିଦ୍ୟୁତ୍ ପ୍ରବାହ (I = Q/t), ଓମ୍‌ଙ୍କ ନିୟମ (V = IR), ଶ୍ରେଣୀ ଓ ସମାନ୍ତର ସଂଯୋଗ ଏବଂ ଜୁଲ୍‌ଙ୍କ ତାପୀୟ ନିୟମ (H = I²Rt) ।',
        summaryEn: 'Electric current in a closed circuit, potential difference, Ohm’s Law (I = V/R), series/parallel equivalent resistance, and Joule heating (H = I²Rt).',
        formula: 'I = V / R | R_s = R₁ + R₂ | 1/R_p = 1/R₁ + 1/R₂ | P = V × I = I²R',
        bridge: { everydayOr: 'ତାରର ବାଧା / ଲାଇନ୍ କଟିବା', schoolOr: 'ପ୍ରତିରୋଧ (R) ଓ ଖୋଲା ପରିପଥ', en: 'Resistance & Open Circuit' },
        sampleQ: {
          promptOr: 'ଗୋଟିଏ 12 V ବ୍ୟାଟେରୀ ସହିତ 4 Ω ଏବଂ 2 Ω ର ଦୁଇଟି ପ୍ରତିରୋଧକ ଶ୍ରେଣୀ ସଂଯୋଗ (Series) ରେ ଯୋଡ଼ାଗଲେ ପରିପଥରେ ବିଦ୍ୟୁତ୍ ପ୍ରବାହ (I) କେତେ ହେବ?',
          promptEn: 'Two resistors of 4 Ω and 2 Ω are connected in series across a 12 V battery. What is the steady current I in the circuit?',
          options: [
            { id: 'A', textOr: '2 A (ମୋଟ ପ୍ରତିରୋଧ R = 4 + 2 = 6 Ω; I = V / R = 12 / 6 = 2 A)', textEn: '2 A (Total R = 4 + 2 = 6 Ω; I = V / R = 12 V / 6 Ω = 2 A)' },
            { id: 'B', textOr: '0.5 A (ଓଲଟା ସୂତ୍ର R / V = 6 / 12 ବ୍ୟବହାର କଲେ)', textEn: '0.5 A (Inverted Ohm’s Law to R / V = 6 / 12)' },
            { id: 'C', textOr: '72 A (V × R = 12 × 6 ଗୁଣନ କଲେ)', textEn: '72 A (Multiplied V × R instead of dividing)' },
            { id: 'D', textOr: '3 A (କେବଳ ପ୍ରଥମ 4 Ω ପ୍ରତିରୋଧକୁ ହିସାବ କଲେ)', textEn: '3 A (Used only the first 4 Ω resistor, ignoring the 2 Ω resistor in series)' }
          ],
          correctOptionId: 'A',
          explanationOr: 'ଶ୍ରେଣୀ ସଂଯୋଗରେ ସମତୁଲ୍ୟ ପ୍ରତିରୋଧ R = 4 Ω + 2 Ω = 6 Ω । ଓମ୍‌ଙ୍କ ନିୟମ ଅନୁସାରେ I = V / R = 12 V / 6 Ω = 2 A ।',
          explanationEn: 'In series, resistances add: R_total = 4 + 2 = 6 Ω. By Ohm’s Law, I = V / R = 12 / 6 = 2 A.'
        }
      },
      {
        id: 'c10_ps_ch1',
        title: 'Chemical Reactions & Equations (ରାସାୟନିକ ପ୍ରତିକ୍ରିୟା ଓ ସମୀକରଣ)',
        odiaTitle: 'ରାସାୟନିକ ପ୍ରତିକ୍ରିୟା ଓ ସମୀକରଣ',
        bookTitle: 'BSE Odisha ଭୌତିକ ବିଜ୍ଞାନ Class-X Ch.1 / NCERT jesc101',
        ncertCode: 'jesc101',
        summaryOr: 'ବସ୍ତୁତ୍ୱ ସଂରକ୍ଷଣ ନିୟମ ଅନୁଯାୟୀ ରାସାୟନିକ ସମୀକରଣ ସମତୁଲ (Balanced) ହେବା ଆବଶ୍ୟକ; ସଂଶ୍ଳେଷଣ, ବିଘଟନ, ବିସ୍ଥାପନ ଓ ଜାରଣ-ବିଜାରଣ ।',
        summaryEn: 'Conservation of mass in balanced chemical equations; combination, decomposition, displacement, double displacement, and redox reactions.',
        formula: '2Mg + O₂ → 2MgO | Fe + CuSO₄ → FeSO₄ + Cu',
        bridge: { everydayOr: 'ଲୁହାରେ କଳଙ୍କି ଲାଗିବା', schoolOr: 'ଜାରଣ ଓ କ୍ଷୟ (Oxidation & Corrosion)', en: 'Oxidation / Rusting of Iron' },
        sampleQ: {
          promptOr: 'ଗୋଟିଏ ରାସାୟନିକ ସମୀକରଣକୁ ସମତୁଲ (Balance) କରିବା ସମୟରେ ଆମେ ଯୌଗିକର ସୂତ୍ର ତଳେ ଥିବା ସଂଖ୍ୟା (Subscript, ଯଥା H₂O କୁ H₂O₂) କାହିଁକି ବଦଳାଇ ପାରିବା ନାହିଁ?',
          promptEn: 'When balancing a chemical equation, why must we change only the front coefficients and never change the chemical formula subscripts (e.g., changing H₂O to H₂O₂)?',
          options: [
            { id: 'A', textOr: 'ସୂତ୍ରର ତଳ ସଂଖ୍ୟା (Subscript) ବଦଳାଇଲେ ପଦାର୍ଥର ରାସାୟନିକ ପରିଚୟ ବଦଳିଯାଏ (ଜଳ H₂O ରୁ ହାଇଡ୍ରୋଜେନ୍ ପେରୋକ୍ସାଇଡ୍ H₂O₂ ହୋଇଯାଏ)', textEn: 'Changing subscripts changes the substance itself (H₂O water becomes H₂O₂ hydrogen peroxide)' },
            { id: 'B', textOr: 'ସମୀକରଣ ସମତୁଲ କରିବା ପାଇଁ ତଳ ସଂଖ୍ୟା ବଦଳାଇବା ସମ୍ପୂର୍ଣ୍ଣ ଠିକ୍ ଅଟେ', textEn: 'Changing subscripts is an allowed shortcut for balancing equations (Subscript-mutation misconception)' },
            { id: 'C', textOr: 'ରାସାୟନିକ ପ୍ରତିକ୍ରିୟାରେ ପରମାଣୁ ନଷ୍ଟ ହୋଇଯାଏ', textEn: 'Atoms are destroyed during a reaction' },
            { id: 'D', textOr: 'ଗୁଣାଙ୍କ (Coefficient) ବଦଳାଇଲେ ବସ୍ତୁତ୍ୱ ସଂରକ୍ଷିତ ହୁଏ ନାହିଁ', textEn: 'Coefficients violate conservation of mass' }
          ],
          correctOptionId: 'A',
          explanationOr: 'ବସ୍ତୁତ୍ୱ ସଂରକ୍ଷଣ ପାଇଁ କେବଳ ଅଣୁ ସଂଖ୍ୟା (Coefficient) ବଦଳାଯାଏ; Subscript ବଦଳାଇଲେ ମୌଳିକ ଯୌଗିକଟି ବଦଳିଯାଏ ।',
          explanationEn: 'Subscripts define the fixed atomic ratio of a compound; balancing adjusts the number of molecules (coefficients) to conserve atoms.'
        }
      },
      {
        id: 'c10_ps_ch3',
        title: 'Light: Reflection & Refraction (ଆଲୋକର ପ୍ରତିଫଳନ ଓ ପ୍ରତିସରଣ)',
        odiaTitle: 'ଆଲୋକ: ପ୍ରତିଫଳନ ଓ ପ୍ରତିସରଣ',
        bookTitle: 'BSE Odisha ଭୌତିକ ବିଜ୍ଞାନ Class-X / NCERT jesc109',
        ncertCode: 'jesc109',
        summaryOr: 'ଗୋଲକୀୟ ଦର୍ପଣ ଓ ଲେନ୍ସ ସୂତ୍ର, ପ୍ରତିସରଣାଙ୍କ (n = c/v) ଏବଂ ଆଲୋକ ବିରଳରୁ ସାନ୍ଦ୍ର ମାଧ୍ୟମକୁ ଗଲେ ଅଭିଲମ୍ବ ଆଡ଼କୁ ବଙ୍କେଇ ଯାଏ ।',
        summaryEn: 'Spherical mirrors and lenses, Cartesian sign convention, Snell’s law of refraction, and refractive index n = c / v.',
        formula: '1/v + 1/u = 1/f (Mirror) | 1/v - 1/u = 1/f (Lens) | n = sin i / sin r',
        bridge: { everydayOr: 'ପାଣି ଭିତରେ ପେନ୍‌ସିଲ୍ ବଙ୍କା ଦିଶିବା', schoolOr: 'ଆଲୋକର ପ୍ରତିସରଣ (Refraction of Light)', en: 'Refraction of Light' },
        sampleQ: {
          promptOr: 'ଆଲୋକ ରଶ୍ମି ବାୟୁ (ବିରଳ ମାଧ୍ୟମ) ରୁ କାଚ (ସାନ୍ଦ୍ର ମାଧ୍ୟମ) ଭିତରକୁ ତିର୍ଯ୍ୟକ୍ ଭାବେ ପ୍ରବେଶ କଲେ କ’ଣ ହୁଏ?',
          promptEn: 'When a ray of light travels obliquely from air (optically rarer) into glass (optically denser), how does it bend?',
          options: [
            { id: 'A', textOr: 'ଆଲୋକର ବେଗ କମିଯାଏ ଏବଂ ରଶ୍ମିଟି ଅଭିଲମ୍ବ (Normal) ଆଡ଼କୁ ବଙ୍କେଇ ଯାଏ', textEn: 'Its speed decreases and the ray bends towards the normal' },
            { id: 'B', textOr: 'ରଶ୍ମିଟି ଅଭିଲମ୍ବ ଠାରୁ ଦୂରକୁ (Away from normal) ଚାଲିଯାଏ', textEn: 'It speeds up and bends away from the normal (Rarer-vs-denser inversion misconception)' },
            { id: 'C', textOr: 'ଆଲୋକର ବେଗ କାଚ ଭିତରେ ବଢ଼ିଯାଏ', textEn: 'Light travels faster in glass than in air' },
            { id: 'D', textOr: 'କୌଣସି ଦିଗ ପରିବର୍ତ୍ତନ ହୁଏ ନାହିଁ', textEn: 'It never bends at an oblique angle' }
          ],
          correctOptionId: 'A',
          explanationOr: 'ସାନ୍ଦ୍ର ମାଧ୍ୟମ (କାଚ) ରେ ଆଲୋକର ବେଗ କମିଯାଏ, ତେଣୁ ରଶ୍ମିଟି ଅଭିଲମ୍ବ ଆଡ଼କୁ ବଙ୍କେଇ ଯାଏ ।',
          explanationEn: 'Light slows down in an optically denser medium (glass), causing the wave front to bend towards the normal.'
        }
      }
    ],
    'Life Science (ଜୀବ ବିଜ୍ଞାନ)': [
      {
        id: 'c10_ls_ch1',
        title: 'Nutrition, Respiration & Transportation (ପୋଷଣ, ଶ୍ୱସନ ଓ ପରିବହନ)',
        odiaTitle: 'ପୋଷଣ, ଶ୍ୱସନ ଓ ପରିବହନ',
        bookTitle: 'BSE Odisha ଜୀବ ବିଜ୍ଞାନ Class-X / NCERT jesc105',
        ncertCode: 'jesc105',
        summaryOr: 'ଆଲୋକଶ୍ଳେଷଣ (Photosynthesis), ବାୟୁ ଉପଜୀବୀ ଓ ଅନୁପଜୀବୀ ଶ୍ୱସନ, ଏବଂ ମାନବ ହୃତ୍‌ପିଣ୍ଡରେ ଦ୍ୱୈତ ରକ୍ତ ସଞ୍ଚାଳନ ।',
        summaryEn: 'Autotrophic photosynthesis, aerobic vs. anaerobic cellular respiration, and double circulation in the four-chambered human heart.',
        formula: '6CO₂ + 12H₂O —(Sunlight / Chlorophyll)→ C₆H₁₂O₆ + 6O₂ + 6H₂O',
        bridge: { everydayOr: 'ଗଛ ଖାଦ୍ୟ ତିଆରି କରିବା', schoolOr: 'ଆଲୋକଶ୍ଳେଷଣ (Photosynthesis)', en: 'Photosynthesis' },
        sampleQ: {
          promptOr: 'ଆଲୋକଶ୍ଳେଷଣ (Photosynthesis) ପ୍ରକ୍ରିୟାରେ ନିର୍ଗତ ହେଉଥିବା ଅମ୍ଳଜାନ ଗ୍ୟାସ୍ (O₂) କେଉଁ ଅଣୁ ବିଘଟনରୁ ଆସିଥାଏ?',
          promptEn: 'During photosynthesis, the oxygen gas (O₂) released into the air comes from the splitting of which molecule?',
          options: [
            { id: 'A', textOr: 'ଜଳ ଅଣୁ (H₂O) ର ଆଲୋକ-ବିଘଟନ (Photolysis of water) ରୁ', textEn: 'From the splitting (photolysis) of water (H₂O) molecules' },
            { id: 'B', textOr: 'ଅଙ୍ଗାରକାମ୍ଳ (CO₂) ଅଣୁ ଭାଙ୍ଗିବାରୁ', textEn: 'From splitting carbon dioxide (CO₂) directly into C and O₂ (CO₂-source misconception)' },
            { id: 'C', textOr: 'ମାଟିର ଖଣିଜ ଲବଣରୁ', textEn: 'From soil minerals' },
            { id: 'D', textOr: 'କ୍ଲୋରୋଫିଲ୍ ଅଣୁରୁ', textEn: 'From chlorophyll breakdown' }
          ],
          correctOptionId: 'A',
          explanationOr: 'ଆଲୋକ ପ୍ରକ୍ରିୟା (Light reaction) ସମୟରେ ଜଳ ଅଣୁ (H₂O) ବିଘଟିତ ହୋଇ ଅମ୍ଳଜାନ (O₂) ଗ୍ୟାସ୍ ନିର୍ଗତ ହୁଏ ।',
          explanationEn: 'Photolysis splits water (2H₂O → 4H⁺ + 4e⁻ + O₂); CO₂ is reduced to form glucose (C₆H₁₂O₆).'
        }
      }
    ],
    'Mathematics (ଗଣିତ · ମାଧ୍ୟମିକ ବୀଜଗଣିତ ଓ ଜ୍ୟାମିତି)': [
      {
        id: 'c10_ma_ch1',
        title: 'Quadratic Equations & Arithmetic Progression (ଦ୍ୱିଘାତ ସମୀକରଣ ଓ ସମାନ୍ତର ପ୍ରଗତି)',
        odiaTitle: 'ଦ୍ୱିଘାତ ସମୀକରଣ ଓ ସମାନ୍ତର ପ୍ରଗତି',
        bookTitle: 'BSE Odisha ମାଧ୍ୟମିକ ବୀଜଗଣିତ Class-X / NCERT jemh104',
        ncertCode: 'jemh104',
        summaryOr: 'ଦ୍ୱିଘାତ ସମୀକରଣ ax² + bx + c = 0 ର ପ୍ରଭେଦକ D = b² - 4ac ଏବଂ ସମାନ୍ତର ପ୍ରଗତିର n-ତମ ପଦ T_n = a + (n-1)d ।',
        summaryEn: 'Nature of roots of ax² + bx + c = 0 using discriminant D = b² - 4ac, and nth term of an Arithmetic Progression a_n = a + (n - 1)d.',
        formula: 'D = b² - 4ac | x = (-b ± √D) / 2a | T_n = a + (n - 1)d',
        bridge: { everydayOr: 'ମୂଳର ପ୍ରକୃତି ଜାଣିବା ସୂତ୍ର', schoolOr: 'ପ୍ରଭେଦକ (Discriminant D = b² - 4ac)', en: 'Discriminant of a Quadratic Equation' },
        sampleQ: {
          promptOr: 'x² - 4x + 4 = 0 ଦ୍ୱିଘାତ ସମୀକରଣର ପ୍ରଭେଦକ (D = b² - 4ac) କେତେ ଏବଂ ଏହାର ମୂଳଦ୍ୱୟ କିପରି ହେବେ?',
          promptEn: 'For the quadratic equation x² - 4x + 4 = 0, what is the discriminant D = b² - 4ac and the nature of its roots?',
          options: [
            { id: 'A', textOr: 'D = 0; ମୂଳଦ୍ୱୟ ବାସ୍ତବ ଓ ସମାନ (Real and equal roots, x = 2, 2)', textEn: 'D = (-4)² - 4(1)(4) = 16 - 16 = 0; roots are real and equal' },
            { id: 'B', textOr: 'D = -32 (କାରଣ -4² = -16 ନିଆଗলে)', textEn: 'D = -32 (Sign error: treated (-4)² as -16 instead of +16)' },
            { id: 'C', textOr: 'D = 32; ମୂଳଦ୍ୱୟ ଅସମାନ', textEn: 'D = 32 (Added 16 + 16 instead of subtracting 4ac)' },
            { id: 'D', textOr: 'କୌଣସି ବାସ୍ତବ ମୂଳ ନାହିଁ', textEn: 'No real roots exist' }
          ],
          correctOptionId: 'A',
          explanationOr: 'ଏଠାରେ a = 1, b = -4, c = 4 । D = (-4)² - 4(1)(4) = 16 - 16 = 0, ତେଣୁ ମୂଳଦ୍ୱୟ ବାସ୍ତବ ଓ ସମାନ ।',
          explanationEn: 'Since (-4)² = +16 and 4ac = 16, D = 16 - 16 = 0, giving real and equal roots (x = 2).'
        }
      }
    ]
  }
};

export const SUBJECTS_BY_CLASS_BAND = {
  foundational: ['Odia (ଭାଷା)', 'English', 'Mathematics (ଗଣିତ)', 'Joyful EVS (ପରିବେଶ)'],
  preparatory: ['Odia (ସାହିତ୍ୟ)', 'English', 'Mathematics (ଗଣିତ)', 'Environmental Studies (ଆମ ପରିବେଶ)'],
  middle: ['MIL Odia', 'English', 'Mathematics', 'General Science (ବିଜ୍ଞାନ)', 'Social Science (ଇତିହାସ ଓ ଭୂଗୋଳ)'],
  secondary: ['MIL Odia', 'English', 'Mathematics', 'Physical Science (ଭୌତିକ ବିଜ୍ଞାନ)', 'Life Science (ଜୀବ ବିଜ୍ଞାନ)', 'History & Geography']
};

export function subjectsForClass(classLevel) {
  const level = SUPPORTED_CLASSES.includes(Number(classLevel)) ? Number(classLevel) : 10;
  if (level <= 2) return SUBJECTS_BY_CLASS_BAND.foundational;
  if (level <= 5) return SUBJECTS_BY_CLASS_BAND.preparatory;
  if (level <= 8) return SUBJECTS_BY_CLASS_BAND.middle;
  return SUBJECTS_BY_CLASS_BAND.secondary;
}

export function chaptersForClassAndSubject(classLevel, subjectName, boardId = 'BSE_ODISHA') {
  return getDistinctChaptersFor(boardId, classLevel, subjectName);
}

export const BLOOM_BY_ITEM_ID = {
  EL01: { bloom: 'UNDERSTAND', cognitiveLoad: 'LOW', format: 'MCQ', videoTopic: 'BSE Odisha Class 10 Closed Circuit Bidyut Paripatha Odia' },
  EL02: { bloom: 'UNDERSTAND', cognitiveLoad: 'LOW', format: 'MCQ', videoTopic: 'BSE Odisha Class 10 Open Switch Circuit Electricity Odia' },
  EL03: { bloom: 'APPLY', cognitiveLoad: 'MEDIUM', format: 'MCQ', videoTopic: 'BSE Odisha Class 10 Heating Effect of Electric Current Odia' },
  EL04: { bloom: 'ANALYZE', cognitiveLoad: 'MEDIUM', format: 'MCQ', videoTopic: 'BSE Odisha Class 10 Thermal Energy Transfer Resistor Odia' },
  EL05: { bloom: 'APPLY', cognitiveLoad: 'MEDIUM', format: 'MCQ', videoTopic: 'BSE Odisha Class 10 Ohms Law V=IR Odia' },
  EL06: { bloom: 'APPLY', cognitiveLoad: 'HIGH', format: 'OBJECTIVE_NUMERIC', videoTopic: 'BSE Odisha Class 10 Ohms Law Numericals 6V 15 Ohm Odia' },
  EL07: { bloom: 'ANALYZE', cognitiveLoad: 'HIGH', format: 'MCQ', videoTopic: 'BSE Odisha Class 10 Series Circuit Current Same Odia' },
  EL08: { bloom: 'EVALUATE', cognitiveLoad: 'HIGH', format: 'MCQ', videoTopic: 'BSE Odisha Class 10 Series Bulbs Brightness Odia' }
};

// Learner-facing wording for the thinking goal. Keep the taxonomy name in the
// content metadata for curriculum/research work, but do not require children to
// know Bloom's terminology to understand what a question is asking them to do.
export const BLOOM_STUDENT_GUIDE = {
  REMEMBER: { label: 'Recall a fact', description: 'Bring back a fact or name you have learned.' },
  UNDERSTAND: { label: 'Explain the idea', description: 'Show what an idea means in your own words.' },
  APPLY: { label: 'Use the idea', description: 'Use what you learned in a question or example.' },
  ANALYZE: { label: 'Find the connection', description: 'Look for how parts, clues, or ideas fit together.' },
  EVALUATE: { label: 'Check a solution', description: 'Use a reason to decide whether an answer makes sense.' },
  CREATE: { label: 'Make something new', description: 'Combine ideas to make a plan, model, or explanation.' },
  UNCLASSIFIED: { label: 'Thinking goal not tagged yet', description: 'This draft question has not been checked for its thinking goal.' }
};

export const MULTI_FORMAT_EXERCISES = [
  {
    id: 'FMT_FILL_01',
    format: 'FILL_BLANK',
    bloom: 'REMEMBER',
    conceptId: 'closed_circuit_flow',
    promptOr: 'ବିଦ୍ୟୁତ୍ ପ୍ରବାହ ଚାଲିବା ପାଇଁ ଗୋଟିଏ ସମ୍ପୂର୍ଣ୍ଣ ______ ପରିପଥ ଦରକାର । (ବନ୍ଦ / ଖୋଲା)',
    promptEn: 'A steady electric current requires a complete ______ circuit path. (closed / open)',
    acceptedAnswers: ['closed', 'ବନ୍ଦ', 'banda'],
    explanationOr: 'ପରିପଥ ସମ୍ପୂର୍ଣ୍ଣ ବନ୍ଦ ଥିଲେ ହିଁ ବିଦ୍ୟୁତ୍ ପ୍ରବାହ ଚାଲେ ।',
    explanationEn: 'Current flows when the conducting loop is closed without a gap.',
    misconceptionOnWrong: 'OPEN_WIRE_CARRIES_STEADY_CURRENT'
  },
  {
    id: 'FMT_NUM_01',
    format: 'OBJECTIVE_NUMERIC',
    bloom: 'APPLY',
    conceptId: 'ohms_law',
    promptOr: 'ଯଦି ବିଭବ ଅନ୍ତର (V) = 6 V ଏବଂ ପ୍ରତିରୋଧ (R) = 15 Ω ହୁଏ, ତେବେ ବିଦ୍ୟୁତ୍ ପ୍ରବାହ (I = V/R) କେତେ ଆମ୍ପିୟର (A) ହେବ?',
    promptEn: 'If potential difference V = 6 V and resistance R = 15 Ω, what is the current I = V / R in amperes (A)?',
    acceptedAnswers: ['0.4', '0.4a', '0.4 a', '0.40'],
    distractorMisconceptions: {
      '2.5': 'DIVIDES_RESISTANCE_BY_VOLTAGE',
      '90': 'MULTIPLIES_VOLTAGE_AND_RESISTANCE',
      '21': 'ADDS_VOLTAGE_AND_RESISTANCE'
    },
    explanationOr: 'ଓମ୍‌ଙ୍କ ନିୟମ ଅନୁସାରେ I = V / R = 6 / 15 = 0.4 A ।',
    explanationEn: 'By Ohms Law, I = V / R = 6 V / 15 Ω = 0.4 A.',
    misconceptionOnWrong: 'DIVIDES_RESISTANCE_BY_VOLTAGE'
  },
  {
    id: 'FMT_MATCH_01',
    format: 'MATCH',
    bloom: 'UNDERSTAND',
    conceptId: 'ohms_law',
    promptOr: 'ଦୈନନ୍ଦିନ ଓଡ଼ିଆ ଶବ୍ଦ ସହିତ ପାଠ୍ୟପୁସ୍ତକ ବିଜ୍ଞାନ ଶବ୍ଦ ମିଳାନ୍ତୁ: "ବାଧା (Opposition to flow)" ର ସଠିକ୍ ବିଜ୍ଞାନ ଶବ୍ଦ କ’ଣ?',
    promptEn: 'Match the everyday Odia word "ବାଧା (opposition)" to its school science term:',
    acceptedAnswers: ['ପ୍ରତିରୋଧ', 'resistance', 'pratirodha'],
    explanationOr: 'ବାଧା = ପ୍ରତିରୋଧ (Resistance, Ω) ।',
    explanationEn: 'Everyday "ବାଧା" corresponds to textbook "ପ୍ରତିରୋଧ (Resistance)".',
    misconceptionOnWrong: 'VOLTAGE_DOUBLES_RESISTANCE'
  }
];

export function gradeMultiFormatExercise(exerciseId, rawInput, customList = MULTI_FORMAT_EXERCISES) {
  const list = Array.isArray(customList) && customList.length > 0 ? customList : MULTI_FORMAT_EXERCISES;
  const ex = list.find((e) => e.id === exerciseId) || MULTI_FORMAT_EXERCISES.find((e) => e.id === exerciseId);
  if (!ex) return { ok: false, error: 'unknown_exercise' };
  const norm = String(rawInput ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!norm) return { ok: false, error: 'empty_input' };
  const accepted = Array.isArray(ex.acceptedAnswers) ? ex.acceptedAnswers : [];
  const isCorrect = accepted.some((ans) => String(ans).toLowerCase().trim() === norm);
  const specificMisconception = (!isCorrect && ex.distractorMisconceptions && ex.distractorMisconceptions[norm])
    ? ex.distractorMisconceptions[norm]
    : (!isCorrect ? (ex.misconceptionOnWrong || 'CONCEPT_GAP_DETECTED') : null);
  return {
    ok: true,
    exerciseId: ex.id,
    format: ex.format,
    bloom: ex.bloom,
    correct: isCorrect,
    misconceptionId: specificMisconception,
    explanationOr: ex.explanationOr,
    explanationEn: ex.explanationEn,
    zeroTokensUsed: true
  };
}

export function defaultFamilyAccount() {
  return {
    accountHolderName: 'Demo account',
    accountRole: 'student',
    email: '',
    phone: '',
    city: '',
    state: '',
    odiaFirst: true,
    activeProfileId: 'prof_child_b',
    profiles: [
      {
        id: 'prof_child_b',
        displayName: 'Sample learner · Class 10',
        role: 'student',
        linkedEmail: '',
        classLevel: 10,
        board: 'BSE_ODISHA',
        medium: 'or_en',
        activeSubject: 'Physical Science (ଭୌତିକ ବିଜ୍ଞାନ)',
        activeChapterId: 'electricity',
        city: '',
        state: '',
        dailyGoal: 5
      },
      {
        id: 'prof_child_a',
        displayName: 'Sample learner · Class 6',
        role: 'student',
        linkedEmail: '',
        classLevel: 6,
        board: 'BSE_ODISHA',
        medium: 'or_en',
        activeSubject: 'General Science (ବିଜ୍ଞାନ)',
        activeChapterId: 'c6_sc_ch2',
        city: '',
        state: '',
        dailyGoal: 5
      }
    ]
  };
}

export function normalizeFamilyAccount(raw) {
  const fallback = defaultFamilyAccount();
  if (!raw || typeof raw !== 'object') return fallback;
  const profiles = Array.isArray(raw.profiles)
    ? raw.profiles
        .filter((p) => p && typeof p === 'object' && typeof p.id === 'string' && typeof p.displayName === 'string')
        .map((p) => {
          const classLevel = SUPPORTED_CLASSES.includes(Number(p.classLevel)) ? Number(p.classLevel) : 10;
          const subjects = subjectsForClass(classLevel);
          const activeSubject = typeof p.activeSubject === 'string' && subjects.includes(p.activeSubject)
            ? p.activeSubject
            : subjects[0];
          const chapters = chaptersForClassAndSubject(classLevel, activeSubject);
          const activeChapterId = typeof p.activeChapterId === 'string' && chapters.some((c) => c.id === p.activeChapterId)
            ? p.activeChapterId
            : (chapters[0]?.id || 'electricity');
          return {
            id: p.id.slice(0, 48),
            displayName: p.displayName.trim().slice(0, 60) || 'Learner',
            role: p.role === 'parent' ? 'parent' : 'student',
            linkedEmail: typeof p.linkedEmail === 'string' ? p.linkedEmail.trim().slice(0, 80) : '',
            classLevel,
            board: typeof p.board === 'string' ? p.board : 'BSE_ODISHA',
            medium: p.medium === 'en' ? 'en' : 'or_en',
            activeSubject,
            activeChapterId,
            city: typeof p.city === 'string' && p.city.trim() ? p.city.trim().slice(0, 40) : 'Bhubaneswar',
            state: typeof p.state === 'string' && p.state.trim() ? p.state.trim().slice(0, 40) : 'Odisha',
            dailyGoal: Math.min(20, Math.max(1, Number(p.dailyGoal) || 5))
          };
        })
    : fallback.profiles;

  const validProfiles = profiles.length > 0 ? profiles : fallback.profiles;
  const activeProfileId = validProfiles.some((p) => p.id === raw.activeProfileId)
    ? raw.activeProfileId
    : validProfiles[0].id;

  return {
    accountHolderName: typeof raw.accountHolderName === 'string' && raw.accountHolderName.trim()
      ? raw.accountHolderName.trim().slice(0, 60)
      : fallback.accountHolderName,
    accountRole: raw.accountRole === 'student' ? 'student' : 'parent',
    email: typeof raw.email === 'string' ? raw.email.trim().slice(0, 80) : fallback.email,
    phone: typeof raw.phone === 'string' ? raw.phone.trim().slice(0, 20) : fallback.phone,
    city: typeof raw.city === 'string' ? raw.city.trim().slice(0, 40) : fallback.city,
    state: typeof raw.state === 'string' ? raw.state.trim().slice(0, 40) : fallback.state,
    odiaFirst: raw.odiaFirst !== false,
    activeProfileId,
    profiles: validProfiles
  };
}

export function computeStoplightConcepts(pack, learner) {
  const concepts = Array.isArray(pack?.concepts) ? pack.concepts : [];
  const items = Array.isArray(pack?.items) ? pack.items : [];
  const answers = Array.isArray(learner?.answers) ? learner.answers : [];

  return concepts.map((concept) => {
    const conceptItemIds = new Set(items.filter((i) => i.conceptId === concept.id).map((i) => i.id));
    const conceptAnswers = answers.filter((a) => conceptItemIds.has(a.itemId));
    if (conceptAnswers.length === 0) {
      return {
        conceptId: concept.id,
        title: concept.title,
        odiaTitle: concept.odiaTitle || concept.title,
        light: 'yellow',
        badge: '🟡 ବାକି ଅଛି · Due to practise',
        detail: 'No attempts yet in this session.'
      };
    }
    const latest = conceptAnswers[conceptAnswers.length - 1];
    const hasMisconception = latest.diagnosis?.type === 'MISCONCEPTION';
    const isUncertain = latest.diagnosis?.type === 'UNCERTAIN' || latest.skippedForTeaching === true;
    if (hasMisconception) {
      return {
        conceptId: concept.id,
        title: concept.title,
        odiaTitle: concept.odiaTitle || concept.title,
        light: 'red',
        badge: '🔴 ମିଥ୍ୟା ଧାରଣା · Focus now',
        detail: `Provisional gap flagged (${latest.diagnosis.misconceptionId || 'needs review'}).`,
      };
    }
    if (isUncertain || !latest.correctOption) {
      return {
        conceptId: concept.id,
        title: concept.title,
        odiaTitle: concept.odiaTitle || concept.title,
        light: 'yellow',
        badge: '🟡 ଅଭ୍ୟାସ ଦରକାର · Review suggested',
        detail: 'Needs another confident explanation.'
      };
    }
    return {
      conceptId: concept.id,
      title: concept.title,
      odiaTitle: concept.odiaTitle || concept.title,
      light: 'green',
      badge: '🟢 ଭଲ ପ୍ରମାଣ · Strong provisional evidence',
      detail: `${conceptAnswers.length} attempt(s); latest matches answer key.`
    };
  });
}

export function computeBloomAndCriAnalytics(learner, criMap = {}) {
  const answers = Array.isArray(learner?.answers) ? learner.answers : [];
  const bloomSummary = {
    UNDERSTAND: { total: 0, correct: 0 },
    APPLY: { total: 0, correct: 0 },
    ANALYZE: { total: 0, correct: 0 },
    EVALUATE: { total: 0, correct: 0 },
    UNCLASSIFIED: { total: 0, correct: 0 }
  };
  const criSummary = {
    confidentCorrect: 0,
    luckyGuess: 0,
    overconfidentMisconception: 0,
    uncertainOrReview: 0
  };

  for (const ans of answers) {
    const meta = BLOOM_BY_ITEM_ID[ans.itemId];
    const b = bloomSummary[meta?.bloom] || bloomSummary.UNCLASSIFIED;
    b.total += 1;
    if (ans.correctOption) b.correct += 1;

    const cri = criMap[ans.id] || criMap[ans.itemId] || 'sure';
    if (ans.correctOption && cri === 'sure') criSummary.confidentCorrect += 1;
    else if (ans.correctOption && cri !== 'sure') criSummary.luckyGuess += 1;
    else if (!ans.correctOption && cri === 'sure' && ans.diagnosis?.type === 'MISCONCEPTION') criSummary.overconfidentMisconception += 1;
    else criSummary.uncertainOrReview += 1;
  }

  return { bloomSummary, criSummary, totalAttempts: answers.length };
}

export function buildAgentStepStrip(learner, online) {
  const answers = Array.isArray(learner?.answers) ? learner.answers : [];
  const latest = answers[answers.length - 1] || null;
  const queued = Array.isArray(learner?.recheckQueue) ? learner.recheckQueue.length : 0;

  if (!latest) {
    return [
      { step: '1. check_answer', label: 'ଉତ୍ତର ଅପେକ୍ଷାରେ · Waiting for answer', state: 'idle' },
      { step: '2. diagnose_reasoning', label: 'ଯୁକ୍ତି ପରୀକ୍ଷା · Ready to check reasoning', state: 'idle' },
      { step: '3. explain_in_odia', label: 'ଓଡ଼ିଆ ବୁଝାଣି · Bilingual explanation ready', state: 'idle' },
      { step: '4. choose_next', label: 'ପରବର୍ତ୍ତୀ ପ୍ରଶ୍ନ · Next item queued', state: 'idle' }
    ];
  }

  const diagDone = latest.diagnosis?.source && !String(latest.diagnosis.source).startsWith('OFFLINE');
  return [
    {
      step: '1. check_answer',
      label: latest.correctOption ? '✓ ଉତ୍ତର ଠିକ୍ · Key matched' : '✗ ଉତ୍ତର ଭିନ୍ନ · Key compared',
      state: 'done'
    },
    {
      step: '2. diagnose_reasoning',
      label: diagDone
        ? `✓ ${latest.diagnosis.source} (${latest.diagnosis.type})`
        : queued > 0
        ? `⏳ ଧାଡ଼ିରେ ଅଛି · Queued (${queued}) ${online ? 're-checking' : 'offline'}`
        : `✓ ${latest.diagnosis?.type || 'PROVISIONAL'}`,
      state: diagDone ? 'done' : 'active'
    },
    {
      step: '3. explain_in_odia',
      label: '✓ ଓଡ଼ିଆ + EN ବୁଝାଣି · Shown on card',
      state: 'done'
    },
    {
      step: '4. choose_next',
      label: `→ ${learner?.nextPlan?.nextItemId || learner?.recommendedItemId || 'EL02'} (${learner?.nextPlan?.source || 'planner'})`,
      state: 'done'
    }
  ];
}


export const COMPLETE_CHAPTER_CATALOG = {
  1: {
    'Odia (ଭାଷା)': [
      { id: 'c1_or_1', title: 'Ch 1: ଛବି ଦେଖି କଥା କହିବା (Picture Story & Oral Expression)', bookTitle: 'OSEPA ହସଖୁସି ଭାଷା Class-I', formula: 'ଚିତ୍ର → ଶବ୍ଦ → ବାକ୍ୟ', summaryOr: 'ଛବି ଦେଖି ନିଜ ଭାଷାରେ ନାମ ଓ କଥା କହିବା ।', summaryEn: 'Observing pictures and naming familiar objects in Odia.' },
      { id: 'c1_or_2', title: 'Ch 2: ଅକ୍ଷର ପରିଚୟ — ଅ, ଆ, ଇ, ଈ (Swarabarna Vowels)', bookTitle: 'OSEPA ହସଖୁସି ଭାଷା Class-I', formula: 'ସ୍ୱରବର୍ଣ୍ଣ: ଅ ଆ ଇ ଈ ଉ ଊ ଋ ଏ ଐ ଓ ୌ', summaryOr: 'ଓଡ଼ିଆ ସ୍ୱରବର୍ଣ୍ଣ ଚିହ୍ନିବା, ଉଚ୍ଚାରଣ ଓ ଲେଖିବା ।', summaryEn: 'Reading, pronouncing, and tracing Odia vowel letters.' },
      { id: 'c1_or_3', title: 'Ch 3: ବ୍ୟଞ୍ଜନ ବର୍ଣ୍ଣ — କ ରୁ ମ (Consonants Ka to Ma)', bookTitle: 'OSEPA ହସଖୁସି ଭାଷା Class-I', formula: 'ବର୍ଗୀୟ ବ୍ୟଞ୍ଜନ (କ-ବର୍ଗ ରୁ ପ-ବର୍ଗ)', summaryOr: 'କ, ଖ, ଗ, ଘ ଠାରୁ ମ ପର୍ଯ୍ୟନ୍ତ ଅକ୍ଷର ଓ ଶବ୍ଦ (କଳସ, ଖରଗୋଶ, ଗଛ) ।', summaryEn: 'Consonant letters from Ka to Ma with everyday words.' },
      { id: 'c1_or_4', title: 'Ch 4: ମାତ୍ରା ଶିକ୍ଷା — ଆ-କାର (ା), ଇ-କାର (ି), ଈ-କାର (ୀ)', bookTitle: 'OSEPA ହସଖୁସି ଭାଷା Class-I', formula: 'କ୍ + ଆ = କା | କ୍ + ଇ = କି', summaryOr: 'ବ୍ୟଞ୍ଜନ ବର୍ଣ୍ଣ ସହିତ ସ୍ୱର ମାତ୍ରା ଯୋଡ଼ି ଶବ୍ଦ ଗଠନ (କାମ, ଚିଠି, ଗୀତ) ।', summaryEn: 'Combining vowel matras with consonants to form words.' },
      { id: 'c1_or_5', title: 'Ch 5: ଉ-କାର (ୁ), ଏ-କାର (େ) ଓ ଓ-କାର (ୋ) ଶବ୍ଦ', bookTitle: 'OSEPA ହସଖୁସି ଭାଷା Class-I', formula: 'ଫୁଲ, କେଶ, ଘୋଡ଼ା', summaryOr: 'ଉ-କାର, ଏ-କାର ଓ ଓ-କାର ମାତ୍ରା ଥିବା ସରଳ ଶବ୍ଦ ଓ ଗୀତ ।', summaryEn: 'Words and rhymes using u, e, and o vowel signs.' },
      { id: 'c1_or_6', title: 'Ch 6: ସରଳ ବାକ୍ୟ ଓ ଛୋଟ ଗପ ପଠନ (Simple Sentences & Stories)', bookTitle: 'OSEPA ହସଖୁସି ଭାଷା Class-I', formula: 'କର୍ତ୍ତା + କର୍ମ + କ୍ରିୟା', summaryOr: 'ଦୁଇ ଓ ତିନି ଶବ୍ଦ ବିଶିଷ୍ଟ ସରଳ ଓଡ଼ିଆ ବାକ୍ୟ ଓ ନୀତିଶିକ୍ଷା ଗପ ।', summaryEn: 'Reading short moral stories and 3-word Odia sentences.' }
    ],
    'English': [
      { id: 'c1_en_1', title: 'Ch 1: Greetings & Magic Words (Good Morning, Thank You)', bookTitle: 'NCERT Mridang / OSEPA English Class-I', formula: 'Greeting + Polite Response', summaryOr: 'ଇଂରାଜୀରେ ଅଭିବାଦନ ଓ ଭଦ୍ର ଶବ୍ଦ (Please, Thank You, Sorry) ।', summaryEn: 'Everyday greetings, self-introduction, and polite magic words.' },
      { id: 'c1_en_2', title: 'Ch 2: Alphabet Sounds A to M (Phonics & Tracing)', bookTitle: 'NCERT Mridang Class-I', formula: 'Capital (A-M) & Small (a-m) Phonics', summaryOr: 'A ରୁ M ପର୍ଯ୍ୟନ୍ତ ଇଂରାଜୀ ଅକ୍ଷର, ଧ୍ୱନି ଓ ଚିତ୍ର ଶବ୍ଦ (Apple, Ball, Cat) ।', summaryEn: 'Letter recognition, phonetic sounds, and vocabulary from A to M.' },
      { id: 'c1_en_3', title: 'Ch 3: Alphabet Sounds N to Z & Rhymes', bookTitle: 'NCERT Mridang Class-I', formula: 'Capital (N-Z) & Small (n-z)', summaryOr: 'N ରୁ Z ପର୍ଯ୍ୟନ୍ତ ଅକ୍ଷର ଓ ଛୋଟ ଇଂରାଜୀ କବିତା ।', summaryEn: 'Letter recognition N to Z and action rhymes.' },
      { id: 'c1_en_4', title: 'Ch 4: Three-Letter CVC Words (a, e, i, o, u)', bookTitle: 'NCERT Mridang Class-I', formula: 'Consonant + Vowel + Consonant (cat, pen, pin, pot, sun)', summaryOr: 'ତିନି ଅକ୍ଷର ବିଶିଷ୍ଟ ଇଂରାଜୀ ଶବ୍ଦ (bat, hen, lip, dog, cup) ପଠନ ।', summaryEn: 'Blending short vowel CVC words.' },
      { id: 'c1_en_5', title: 'Ch 5: Naming Words (Colours, Fruits & Animals)', bookTitle: 'NCERT Mridang Class-I', formula: 'This is a [Colour] [Noun].', summaryOr: 'ରଙ୍ଗ, ଫଳ ଓ ପଶୁପକ୍ଷୀଙ୍କର ଇଂରାଜୀ ନାମ ।', summaryEn: 'Identifying colours, fruits, and animals in simple sentences.' }
    ],
    'Mathematics (ଗଣିତ)': [
      { id: 'c1_ma_1', title: 'Ch 1: Shapes & Space (Inside-Outside, Bigger-Smaller)', bookTitle: 'OSEPA ହସଖୁସି ଗଣିତ / NCERT Joyful Math-I', formula: 'Spatial comparison: Near/Far, Top/Bottom, Round/Flat', summaryOr: 'ଭିତର-ବାହାର, ବଡ଼-ଛୋଟ, ପାଖ-ଦୂର ଏବଂ ଗୋଲ ଓ ଚଉକୋଣ ଆକୃତି ।', summaryEn: 'Pre-number spatial concepts and basic 2D/3D shapes.' },
      { id: 'c1_ma_2', title: 'Ch 2: Numbers 1 to 9 & Zero (୧ ରୁ ୯ ଏବଂ ଶୂନ ୦)', bookTitle: 'OSEPA ହସଖୁସି ଗଣିତ Class-I', formula: 'Count objects: 1..9 and 0 (Empty)', summaryOr: '୧ ରୁ ୯ ପର୍ଯ୍ୟନ୍ତ ବସ୍ତୁ ଗଣିବା, ତୁଳନା କରିବା ଏବଂ ଶୂନ (୦) ର ଧାରଣା ।', summaryEn: 'Counting 1 to 9 concrete items and understanding Zero (0).' },
      { id: 'c1_ma_3', title: 'Ch 3: Single-Digit Addition (ମିଶାଣ · Combining Groups)', bookTitle: 'OSEPA ହସଖୁସି ଗଣିତ Class-I', formula: 'a + b = Total (e.g., 3 + 4 = 7)', summaryOr: 'ଦୁଇଟି ସମୂହକୁ ଏକାଠି ମିଶାଇ ମୋଟ ସଂଖ୍ୟା ବାହାର କରିବା ।', summaryEn: 'Adding single-digit numbers by combining objects.' },
      { id: 'c1_ma_4', title: 'Ch 4: Single-Digit Subtraction (ଫେଡ଼ାଣ · Taking Away)', bookTitle: 'OSEPA ହସଖୁସି ଗଣିତ Class-I', formula: 'Total - Taken Away = Left (e.g., 8 - 3 = 5)', summaryOr: 'ମୋଟ ବସ୍ତୁରୁ କିଛି କାଢ଼ି ନେଲେ କେତେ ବାକି ରହେ (ଫେଡ଼ାଣ) ।', summaryEn: 'Subtraction up to 9 by taking away objects.' },
      { id: 'c1_ma_5', title: 'Ch 5: Numbers 10 to 20 (Bundling 1 Ten + Ones)', bookTitle: 'OSEPA ହସଖୁସି ଗଣିତ Class-I', formula: '1 Ten (୧୦) + n Ones = 10 + n', summaryOr: '୧୦ ଟି କାଠିର ଗୋଟିଏ ବିଡ଼ା (୧ ଦଶକ) ଏବଂ ୧୦ ରୁ ୨୦ ପର୍ଯ୍ୟନ୍ତ ସଂଖ୍ୟା ।', summaryEn: 'Making a bundle of 10 and building numbers from 10 to 20.' }
    ],
    'Joyful EVS (ପରିବେଶ)': [
      { id: 'c1_ev_1', title: 'Ch 1: About Myself & My Body Parts (ମୋ ଶରୀର ଓ ଇନ୍ଦ୍ରିୟ)', bookTitle: 'OSEPA ପରିବେଶ Class-I', formula: '5 Sense Organs: ଆଖି, କାନ, ନାକ, ଜିଭ, ଚର୍ମ', summaryOr: 'ଆମ ଶରୀରର ବିଭିନ୍ନ ଅଙ୍ଗ ଓ ୫ଟି ଜ୍ଞାନେନ୍ଦ୍ରିୟର କାର୍ଯ୍ୟ ।', summaryEn: 'External body parts and the 5 sense organs.' },
      { id: 'c1_ev_2', title: 'Ch 2: My Family, Home & School (ମୋ ପରିବାର ଓ ବିଦ୍ୟାଳୟ)', bookTitle: 'OSEPA ପରିବେଶ Class-I', formula: 'Family Members, Clean Home & Classroom Rules', summaryOr: 'ପରିବାରର ସଦସ୍ୟ, ଘରର ସ୍ୱଚ୍ଛତା ଓ ବିଦ୍ୟାଳୟ ପରିବେଶ ।', summaryEn: 'Understanding family relationships, home safety, and school habits.' },
      { id: 'c1_ev_3', title: 'Ch 3: Good Habits, Food & Clean Water (ସୁସ୍ଥ ଅଭ୍ୟାସ ଓ ଖାଦ୍ୟ)', bookTitle: 'OSEPA ପରିବେଶ Class-I', formula: 'Handwashing + Clean Drinking Water + Healthy Food', summaryOr: 'ଦାନ୍ତ ଘଷିବା, ହାତ ଧୋଇବା, ପୁଷ୍ଟିକର ଖାଦ୍ୟ ଓ ବିଶୁଦ୍ଧ ପାନୀୟ ଜଳ ।', summaryEn: 'Personal hygiene, healthy food vs. junk food, and safe water.' },
      { id: 'c1_ev_4', title: 'Ch 4: Plants & Animals Around Us (ଗଛଲତା ଓ ପଶୁପକ୍ଷୀ)', bookTitle: 'OSEPA ପରିବେଶ Class-I', formula: 'Domestic vs. Wild Animals | Trees, Flowers & Fruits', summaryOr: 'ଆମ ଚାରିପାଖର ଗଛ, ଫୁଲ, ଫଳ ଏବଂ ଗୃହପାଳିତ ଓ ବନ୍ୟ ପ୍ରାଣୀ ।', summaryEn: 'Identifying common trees, flowers, birds, domestic pets, and wild animals.' }
    ]
  }
};

export function getDistinctChaptersFor(boardId, classLevel, subjectName) {
  const cls = Number(classLevel) || 10;
  const sub = String(subjectName || '').trim();
  const brd = String(boardId || 'BSE_ODISHA').trim();
  const boardPrefix = brd === 'CBSE' ? 'NCERT' : brd === 'ICSE' ? 'CISCE/ICSE' : 'BSE Odisha / OSEPA';

  if (COMPLETE_CHAPTER_CATALOG[cls] && COMPLETE_CHAPTER_CATALOG[cls][sub]) {
    return COMPLETE_CHAPTER_CATALOG[cls][sub].map((ch) => ({ ...ch, bookTitle: `${boardPrefix} · Class ${cls} ${sub}` }));
  }

  const sLow = sub.toLowerCase();
  const makeCh = (idx, titleEn, titleOr, formula, sumOr, sumEn, customQ = null) => {
    let defaultQ;
    if (sLow.includes('english')) {
      defaultQ = {
        promptOr: `[ଶ୍ରେଣୀ ${cls} ଇଂରାଜୀ · ${titleOr}] "${titleEn}" ଅନୁଯାୟୀ ନିମ୍ନলিখିତ ମଧ୍ୟରୁ କେଉଁ ବାକ୍ୟ ବା ବ୍ୟାକରଣ ନିୟମଟି ସଠିକ୍?`,
        promptEn: `[Class ${cls} English · ${titleEn}] Which option follows the correct English grammar and comprehension rule for this chapter?`,
        options: [
          { id: 'A', textOr: `କର୍ତ୍ତା ଓ କ୍ରିୟାପଦର ସଠିକ୍ ସମନ୍ୱୟ (${formula})`, textEn: `Follows the standard rule: ${sumEn} (${formula})` },
          { id: 'B', textOr: `ଏକବଚନ କର୍ତ୍ତା ସହିତ ବହୁବଚନ କ୍ରିୟାପଦର ଭୁଲ୍ ପ୍ରୟୋଗ`, textEn: `Mismatches subject number and verb tense in the sentence` },
          { id: 'C', textOr: `ବାକ୍ୟର ମୁଖ୍ୟ ଭାବକୁ ବଦଳାଇ ଦେଉଥିବା ଭୁଲ୍ ଶବ୍ଦ ଚୟନ`, textEn: `Changes the core meaning by using an incorrect preposition or tense` },
          { id: 'D', textOr: `ଅସମ୍ପୂର୍ଣ୍ଣ ବାକ୍ୟ ଗଠନ (Fragment without main verb)`, textEn: `Leaves the clause incomplete without a finite verb` }
        ],
        correctOptionId: 'A',
        explanationOr: `ଓଡ଼ିଆ ବୁଝାଣି: ଇଂରାଜୀ ବ୍ୟାକରଣ ଓ ପଠନ ନିୟମ ଅନୁଯାୟୀ ${sumOr} (${formula}) ।`,
        explanationEn: `Explanation: In Class ${cls} English ("${titleEn}"), ${sumEn} (${formula}).`
      };
    } else if (sLow.includes('odia') || sLow.includes('ଓଡ଼ିଆ') || sLow.includes('ସାହିତ୍ୟ')) {
      defaultQ = {
        promptOr: `[ଶ୍ରେଣୀ ${cls} ଓଡ଼ିଆ · ${titleOr}] "${titleOr}" ଅଧ୍ୟାୟ ଅନୁସାରେ କେଉଁ ଭାଷା ଓ ବ୍ୟାକରଣ ନିୟମଟି ସଠିକ୍?`,
        promptEn: `[Class ${cls} Odia · ${titleEn}] Which statement accurately reflects the Odia literature and grammar rule of this chapter?`,
        options: [
          { id: 'A', textOr: `${sumOr} (${formula})`, textEn: `Accurate Odia rule: ${sumEn}` },
          { id: 'B', textOr: `ବର୍ଣ୍ଣ ଓ ମାତ୍ରା ସଂଯୋଗରେ ଅଶୁଦ୍ଧ ବନାନ`, textEn: `Incorrect matra or sandhi combination changing word meaning` },
          { id: 'C', textOr: `ବାକ୍ୟରେ କାରକ ଓ ବିଭକ୍ତିର ଭୁଲ୍ ପ୍ରୟୋଗ`, textEn: `Misapplies case ending (vibhakti) to the subject or object` },
          { id: 'D', textOr: `କବିତା ବା ଗଦ୍ୟର ମୂଳ ଭାବଠାରୁ ବିଚ୍ୟୁତ ଅର୍ଥ`, textEn: `Literal word-by-word translation that misses the literary meaning` }
        ],
        correctOptionId: 'A',
        explanationOr: `ଓଡ଼ିଆ ବୁଝାଣି: ${sumOr} (${formula}) ।`,
        explanationEn: `Explanation: ${sumEn} (${formula}).`
      };
    } else if (sLow.includes('history') || sLow.includes('geography') || sLow.includes('social') || sLow.includes('ଇତିହାସ')) {
      defaultQ = {
        promptOr: `[ଶ୍ରେଣୀ ${cls} ସାମାଜିକ ବିଜ୍ଞାନ · ${titleOr}] "${titleOr}" ଅଧ୍ୟାୟ ଅନୁଯାୟୀ କେଉଁ ଐତିହାସିକ ବା ଭୌଗୋଳିକ ତଥ୍ୟଟି ସଠିକ୍?`,
        promptEn: `[Class ${cls} Social Science · ${titleEn}] Which historical, civic, or geographical statement is accurate?`,
        options: [
          { id: 'A', textOr: `${sumOr}`, textEn: `${sumEn} (${formula})` },
          { id: 'B', textOr: `ଘଟଣାବଳୀର କାଳକ୍ରମ ଓ କାରଣକୁ ଓଲଟପାଲଟ କରିବା`, textEn: `Reverses the chronological order and cause-effect of events` },
          { id: 'C', textOr: `ଭୌଗୋଳିକ ଜଳବାୟୁ ଓ ସମ୍ପଦ ବଣ୍ଟନର ଭୁଲ୍ ତୁଳନା`, textEn: `Confuses regional climate zones and resource distribution` },
          { id: 'D', textOr: `ସମ୍ବିଧାନିକ ଅଧିକାର ଓ ଶାସନ ବ୍ୟବସ୍ଥାର ଭୁଲ୍ ବ୍ୟାଖ୍ୟା`, textEn: `Misidentifies constitutional roles between state and union organs` }
        ],
        correctOptionId: 'A',
        explanationOr: `ଓଡ଼ିଆ ବୁଝାଣି: ${sumOr} (${formula}) ।`,
        explanationEn: `Explanation: ${sumEn} (${formula}).`
      };
    } else {
      defaultQ = {
        promptOr: `[ଶ୍ରେଣୀ ${cls} · ${sub} · ${titleOr}] "${titleOr}" ଅଧ୍ୟାୟର ମୌଳିକ ନିୟମ ଅନୁସାରେ କେଉଁ ଉକ୍ତିଟି ସଠିକ୍?`,
        promptEn: `[Class ${cls} ${boardPrefix} · ${sub}] In "${titleEn}", which scientific or mathematical relationship holds true?`,
        options: [
          { id: 'A', textOr: `${sumOr}`, textEn: `${sumEn} (${formula})` },
          { id: 'B', textOr: `ସୂତ୍ରରେ ଥିବା ରାଶିଗୁଡ଼ିକୁ ଓଲଟା ପ୍ରୟୋଗ କରିବା`, textEn: `Inverts the formula relationship (${formula})` },
          { id: 'C', textOr: `ଏକକ ଓ ସ୍ଥାନୀୟ ମାନକୁ ଅଣଦେଖା କରିବା`, textEn: `Drops standard units or place-value alignment during calculation` },
          { id: 'D', textOr: `ସଂରକ୍ଷଣ ନିୟମ ବା ମୌଳିକ ସର୍ତ୍ତକୁ ଭୁଲିଯିବା`, textEn: `Violates the conservation law or condition of the chapter` }
        ],
        correctOptionId: 'A',
        explanationOr: `ଓଡ଼ିଆ ବୁଝାଣି: ${sumOr} (${formula}) ।`,
        explanationEn: `Explanation: ${sumEn} (Key rule: ${formula}).`
      };
    }
    return {
      id: `${brd.toLowerCase()}_c${cls}_${sLow.replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}_ch${idx}`,
      title: `Ch ${idx}: ${titleEn} (${titleOr})`,
      odiaTitle: titleOr,
      bookTitle: `${boardPrefix} Textbook · Class ${cls} ${sub}`,
      formula,
      summaryOr: sumOr,
      summaryEn: sumEn,
      bridge: { everydayOr: titleOr, schoolOr: titleOr, en: titleEn },
      sampleQ: customQ || defaultQ
    };
  };

  if (sLow.includes('math') || sLow.includes('ଗଣିତ')) {
    const mathTopics = [
      [`Class ${cls} Number System & Place Value`, 'ସଂଖ୍ୟା ପଦ୍ଧତି ଓ ସ୍ଥାନୀୟ ମାନ', 'Place Value & Number Line Operations'],
      [`Class ${cls} Arithmetic Operations & Factors`, 'ଗାଣିତିକ ପ୍ରକ୍ରିୟା, ଗ.ସା.ଗୁ ଓ ଲ.ସା.ଗୁ', 'HCF × LCM = Product of Numbers'],
      [`Class ${cls} Fractions, Decimals & Ratios`, 'ଭଗ୍ନାଂଶ, ଦଶମିକ ଓ ଅନୁପାତ', 'a/b = (a×k)/(b×k) | Percentage'],
      [`Class ${cls} Algebra & Equations`, 'ବୀଜଗଣିତ ଓ ସମୀକରଣ ସମାଧାନ', 'Linear / Quadratic Equation Roots'],
      [`Class ${cls} Geometry: Angles, Triangles & Circles`, 'ଜ୍ୟାମିତି: କୋଣ, ତ୍ରିଭୁଜ ଓ ବୃତ୍ତ', 'Sum of angles in △ = 180° | Pythagoras'],
      [`Class ${cls} Mensuration (Perimeter, Area, Volume) & Data`, 'ପରିମିତି (କ୍ଷେତ୍ରଫଳ ଓ ଆୟତନ) ଓ ପରିସଂଖ୍ୟାନ', 'Area, Surface Area, Volume & Mean/Median']
    ];
    return mathTopics.map((item, i) => makeCh(i + 1, item[0], item[1], item[2], `ଶ୍ରେଣୀ ${cls} ଗଣିତ ଅଧ୍ୟାୟ ${i+1}: ${item[1]} ର ସୂତ୍ର ଓ ପ୍ରୟୋଗ ।`, `Class ${cls} Mathematics Ch ${i+1}: ${item[0]} principles and problem solving.`));
  }

  if (sLow.includes('life') || sLow.includes('ଜୀବ')) {
    const lifeTopics = [
      ['Nutrition (ପୋଷଣ · Autotrophic & Digestive System)', 'ପୋଷଣ ଓ ଆଲୋକଶ୍ଳେଷଣ', '6CO₂ + 12H₂O → C₆H₁₂O₆ + 6O₂ + 6H₂O'],
      ['Respiration (ଶ୍ୱସନ · Aerobic & Cellular ATP)', 'ଶ୍ୱସନ (ବାୟୁ ଉପଜୀବୀ ଓ ଅନୁପଜୀବୀ)', 'Glucose → Pyruvate → ATP + CO₂ + H₂O'],
      ['Transportation & Circulation (ପରିବହନ ଓ ହୃତ୍‌ପିଣ୍ଡ)', 'ପରିବହନ ଓ ରକ୍ତ ସଞ୍ଚାଳନ', 'Double Circulation | Xylem & Phloem'],
      ['Excretion (ରେଚନ · Nephron & Osmoregulation)', 'ରେଚନ ଓ ବୃକ୍‌କର ଗଠନ', 'Ultrafiltration & Reabsorption'],
      ['Control & Coordination (ସ୍ନାୟୁତନ୍ତ୍ର ଓ ହରମୋନ୍)', 'ନିୟନ୍ତ୍ରଣ ଓ ସମନ୍ୱୟ', 'Reflex Arc & Endocrine Glands'],
      ['Reproduction, Heredity & Ecosystem (ଜନନ, ବଂଶାନୁକ୍ରମ ଓ ପରିବେଶ)', 'ଜନନ, ମେଣ୍ଡେଲ୍‌ଙ୍କ ନିୟମ ଓ ପରିසଂସ୍ଥା', 'Mitosis/Meiosis | 10% Energy Law']
    ];
    return lifeTopics.map((item, i) => makeCh(i + 1, item[0], item[1], item[2], `ଶ୍ରେଣୀ ${cls} ଜୀବ ବିଜ୍ଞାନ: ${item[1]} ।`, `Class ${cls} Life Science: ${item[0]}.`));
  }

  if (sLow.includes('science') || sLow.includes('ବିଜ୍ଞାନ') || sLow.includes('evs') || sLow.includes('ପରିବେଶ')) {
    const sciTopics = [
      [`Class ${cls} Matter, Materials & Chemical Changes`, 'ପଦାର୍ଥର ଅବସ୍ଥା ଓ ରାସାୟନିକ ପରିବର୍ତ୍ତନ', 'Conservation of Mass & Properties of Matter'],
      [`Class ${cls} Acids, Bases, Metals & Non-Metals`, 'ଅମ୍ଳ, କ୍ଷାରକ, ଲବଣ ଓ ଧାତୁ-ଅଧାତୁ', 'pH Scale & Neutralisation Reaction'],
      [`Class ${cls} Force, Motion, Friction & Pressure`, 'ଗତି, ବଳ, ଘର୍ଷଣ ଓ ଚାପ', 'F = ma | Pressure P = F / A'],
      [`Class ${cls} Work, Energy, Heat & Sound`, 'କାର୍ଯ୍ୟ, ଶକ୍ତି, ତାପ ଓ ଧ୍ୱନି', 'W = F·s | Conservation of Energy'],
      [`Class ${cls} Electricity & Circuits (ବିଦ୍ୟୁତ୍ ଓ ପରିପଥ)`, 'ବିଦ୍ୟୁତ୍ ପ୍ରବାହ, ପରିପଥ ଓ ଓମ୍‌ଙ୍କ ନିୟମ', 'I = V / R | Series & Parallel Circuits | H = I²Rt'],
      [`Class ${cls} Light (Reflection/Refraction) & Magnetism`, 'ଆଲୋକ ଓ ଚୁମ୍ବକୀୟ ପ୍ରଭାବ', 'Laws of Reflection, Refraction & Electromagnets']
    ];
    return sciTopics.map((item, i) => makeCh(i + 1, item[0], item[1], item[2], `ଶ୍ରେଣୀ ${cls} ବିଜ୍ଞାନ ଅଧ୍ୟାୟ ${i+1}: ${item[1]} ।`, `Class ${cls} Science Ch ${i+1}: ${item[0]}.`));
  }

  if (sLow.includes('odia') || sLow.includes('ଓଡ଼ିଆ') || sLow.includes('ସାହିତ୍ୟ')) {
    const odiaTopics = [
      [`Class ${cls} Odia Poetry: Patriotism & Nature (ଜନ୍ମଭୂମି ଓ ପ୍ରକୃତି କବିତା)`, 'ଜନ୍ମଭୂମି ଓ ପ୍ରକୃତି କବିତା', 'କବି ପରିଚୟ, କେନ୍ଦ୍ରୀୟ ଭାବ ଓ ସରଳାର୍ଥ'],
      [`Class ${cls} Odia Prose: Culture & Biography (ଓଡ଼ିଶାର ସଂସ୍କୃତି ଓ ଜୀବନୀ)`, 'ଓଡ଼ିଶାର ସଂସ୍କୃତି ଓ ଆଦର୍ଶ ଜୀବନୀ', 'ଗଦ୍ୟାଂଶ ବୋଧଜ୍ଞାନ ଓ ଶବ୍ଦାର୍ଥ'],
      [`Class ${cls} Odia Short Stories (ଓଡ଼ିଆ ଗଳ୍ପ ଓ ନୀତିଶିକ୍ଷା)`, 'ଓଡ଼ିଆ ଗଳ୍ପ ଓ ଚରିତ୍ର ବିଶ୍ଳେଷଣ', 'ଚରିତ୍ର ଚିତ୍ରଣ ଓ ମୁଖ୍ୟ ବାର୍ତ୍ତା'],
      [`Class ${cls} Odia Grammar: Sandhi, Samasa & Karaka (ବ୍ୟାକରଣ)`, 'ଓଡ଼ିଆ ବ୍ୟାକରଣ: ପଦ, ସନ୍ଧି, ସମାସ ଓ କାରକ', 'ସ୍ୱରସନ୍ଧି + ବ୍ୟଞ୍ଜନସନ୍ଧି | କାରକ ଓ ବିଭକ୍ତି'],
      [`Class ${cls} Odia Grammar: Sentence Types & Idioms (ବାକ୍ୟ ବିଚାର ଓ ରୂଢ଼ି)`, 'ବାକ୍ୟ ବିଚାର ଓ ରୂଢ଼ି ପ୍ରୟୋଗ', 'ସରଳ, ଯୌଗିକ ଓ ଜଟିଳ ବାକ୍ୟ'],
      [`Class ${cls} Odia Composition & Letter Writing (ରଚନା ଓ ପତ୍ର ଲେଖନ)`, 'ରଚନା ଓ ଦରଖାସ୍ତ ଲେଖନ', 'ଉପକ୍ରମ → ବିଷୟବସ୍ତୁ → ଉପସଂହାର']
    ];
    return odiaTopics.map((item, i) => makeCh(i + 1, item[0], item[1], item[2], `ଶ୍ରେଣୀ ${cls} ଓଡ଼ିଆ ଅଧ୍ୟାୟ ${i+1}: ${item[1]} ।`, `Class ${cls} Odia Ch ${i+1}: ${item[0]}.`));
  }

  if (sLow.includes('english')) {
    const engTopics = [
      [`Class ${cls} English Prose: Reading & Comprehension`, 'ଇଂରାଜୀ ଗଦ୍ୟ ପଠନ ଓ ବୋଧଜ୍ଞାନ', 'Main Idea, Inference & Vocabulary'],
      [`Class ${cls} English Poetry: Imagery, Rhyme & Theme`, 'ଇଂରାଜୀ କବିତା ଓ ଅଳଙ୍କାର', 'Stanza Meaning & Poetic Devices'],
      [`Class ${cls} English Grammar: Tenses & Subject-Verb Agreement`, 'କାଳ (Tenses) ଓ Subject-Verb Agreement', 'Singular Subject → Singular Verb'],
      [`Class ${cls} English Grammar: Active/Passive Voice & Direct/Indirect Speech`, 'Active/Passive Voice ଓ Narration', 'Object becomes Subject + Be + V3'],
      [`Class ${cls} English Grammar: Prepositions, Clauses & Modals`, 'Prepositions, Clauses ଓ Modals', 'Relative & Conditional Clauses'],
      [`Class ${cls} English Writing: Letters, Applications & Paragraphs`, 'ଇଂରାଜୀ ପତ୍ର, ଦରଖାସ୍ତ ଓ ଅନୁଚ୍ଛେଦ ଲେଖନ', 'Formal & Informal Writing Structure']
    ];
    return engTopics.map((item, i) => makeCh(i + 1, item[0], item[1], item[2], `ଶ୍ରେଣୀ ${cls} ଇଂରାଜୀ ଅଧ୍ୟାୟ ${i+1}: ${item[1]} ।`, `Class ${cls} English Ch ${i+1}: ${item[0]}.`));
  }

  const ssTopics = [
    [`Class ${cls} History: Odisha & Indian Heritage (ଓଡ଼ିଶା ଓ ଭାରତର ଇତିହାସ)`, 'ଓଡ଼ିଶା ଓ ଭାରତର ଐତିହାସିକ ଘଟଣାବଳୀ', 'Chronology, Primary Sources & Cultural Impact'],
    [`Class ${cls} Freedom Movement & Formation of Modern Odisha (1936)`, 'ଭାରତୀୟ ଜାତୀୟ ଆନ୍ଦୋଳନ ଓ ସ୍ୱତନ୍ତ୍ର ଓଡ଼ିଶା ପ୍ରଦେଶ ଗଠନ', '1 April 1936: Formation of Odisha'],
    [`Class ${cls} Civics: Indian Constitution, Rights & Governance`, 'ଭାରତୀୟ ସମ୍ବିଧାନ, ମୌଳିକ ଅଧିକାର ଓ ଶାସନ', 'Legislature + Executive + Judiciary'],
    [`Class ${cls} Geography: Physical Features, Rivers & Monsoon Climate`, 'ଭାରତ ଓ ଓଡ଼ିଶାର ଭୂപ്രକୃତି, ନଦୀ ଓ ଜଳବାୟୁ', 'Eastern Ghats, Coastal Plains & Rivers'],
    [`Class ${cls} Geography: Soil, Agriculture, Minerals & Industries`, 'ମୃତ୍ତିକା, କୃଷି, ଖଣିଜ ସମ୍ପଦ ଓ ଶିଳ୍ପ', 'Kharif/Rabi Crops & Mineral Resources'],
    [`Class ${cls} Economics: Livelihoods, Banking & Development`, 'ଅର୍ଥନୀତି: କୃଷି, ଶିଳ୍ପ, ସେବା କ୍ଷେତ୍ର ଓ ବ୍ୟାଙ୍କିଙ୍ଗ୍', 'Primary, Secondary & Tertiary Sectors']
  ];
  return ssTopics.map((item, i) => makeCh(i + 1, item[0], item[1], item[2], `ଶ୍ରେଣୀ ${cls} ସାମାଜିକ ବିଜ୍ଞାନ ଅଧ୍ୟାୟ ${i+1}: ${item[1]} ।`, `Class ${cls} Social Science Ch ${i+1}: ${item[0]}.`));
}
