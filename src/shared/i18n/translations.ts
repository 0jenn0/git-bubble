export const translations = {
  ko: {
    // Common
    required: '필수',
    optional: '선택',

    // Tabs
    bubble: '말풍선',
    linkPreview: '링크 프리뷰',
    divider: '디바이더',

    // Mode
    tags: '태그',
    text: '텍스트',

    // Direction
    left: '왼쪽',
    right: '오른쪽',

    // Animation
    none: '없음',
    animationOn: '애니메이션 켜짐',
    animationOff: '애니메이션 꺼짐',
    animationDescription: '물결치듯 움직이는 귀여운 애니메이션 효과',

    // Placeholders & hints
    tagsPlaceholder: '태그1,태그2,태그3',
    tagsSeparator: '쉼표로 구분',
    textPlaceholder: '일반 텍스트를 입력하세요...',
    textAutoWrap: '자동으로 줄바꿈됩니다',
    titlePlaceholder: '제목 (선택사항)',

    // Profile Image
    uploading: '업로드 중...',
    clickToChange: '클릭하여 변경',
    dragOrClick: '이미지를 드래그하거나 클릭하여 업로드',
    imageFormats: 'JPG, PNG, GIF, WebP (최대 5MB)',
    orEnterUrl: '또는 URL 직접 입력',
    removeImage: '이미지 제거',
    uploadFailed: '업로드 실패',

    // Link Settings
    enterUrlHint: '미리보기할 웹사이트 URL을 입력하세요',
    thumbnailHint: '썸네일이 없는 경우: 웹사이트에 OG 이미지가 없으면 썸네일 영역이 비어있게 됩니다. 원하는 이미지를 직접 업로드하여 사용할 수 있습니다.',
    customThumbnailUpload: '커스텀 썸네일 업로드 (선택)',
    removeThumbnail: '썸네일 제거',

    // Badge
    badgeEnabled: '뱃지 활성화',
    badgeDisabled: '뱃지 비활성화',
    badgeText: '뱃지 텍스트',
    badgeTextHint: '이미지가 없을 때 표시됩니다 (최대 10자)',
    badgeColor: '뱃지 색상',
    badgeImage: '뱃지 이미지 (선택)',
    badgeImageUpload: '뱃지 이미지 업로드 (선택)',
    badgeDescription: '뱃지는 링크 프리뷰 왼쪽 상단에 펄스 애니메이션과 함께 표시됩니다.',

    // Divider
    sizeLabel: '요소 크기 조절 (50% ~ 200%)',
    dividerDescription: 'GitHub README에서 섹션을 구분하는 귀여운 디바이더',

    // Style labels
    dots: '도트',
    dashes: '대시',
    stars: '별',
    hearts: '하트',
    sparkles: '스파클',

    // Preview
    missingValuePrefix: '필수값',
    missingValueSuffix: '을 넣어주세요!',
    enterUrlPrefix: '미리보기할',
    enterUrlSuffix: '을 입력해주세요!',

    // Copy Button
    copied: '✓ 복사됨',
    copyToClipboard: '클립보드에 복사',
  },
  en: {
    // Common
    required: 'Required',
    optional: 'Optional',

    // Tabs
    bubble: 'Bubble',
    linkPreview: 'Link Preview',
    divider: 'Divider',

    // Mode
    tags: 'Tags',
    text: 'Text',

    // Direction
    left: 'Left',
    right: 'Right',

    // Animation
    none: 'None',
    animationOn: 'Animation On',
    animationOff: 'Animation Off',
    animationDescription: 'Cute wave animation effect',

    // Placeholders & hints
    tagsPlaceholder: 'tag1,tag2,tag3',
    tagsSeparator: 'Separate with commas',
    textPlaceholder: 'Enter your text here...',
    textAutoWrap: 'Text will wrap automatically',
    titlePlaceholder: 'Title (optional)',

    // Profile Image
    uploading: 'Uploading...',
    clickToChange: 'Click to change',
    dragOrClick: 'Drag or click to upload image',
    imageFormats: 'JPG, PNG, GIF, WebP (max 5MB)',
    orEnterUrl: 'or enter URL directly',
    removeImage: 'Remove image',
    uploadFailed: 'Upload failed',

    // Link Settings
    enterUrlHint: 'Enter the website URL to preview',
    thumbnailHint: 'When no thumbnail: If the website has no OG image, the thumbnail area will be empty. You can upload your own image.',
    customThumbnailUpload: 'Upload custom thumbnail (optional)',
    removeThumbnail: 'Remove thumbnail',

    // Badge
    badgeEnabled: 'Badge enabled',
    badgeDisabled: 'Badge disabled',
    badgeText: 'Badge text',
    badgeTextHint: 'Shown when no image (max 10 chars)',
    badgeColor: 'Badge color',
    badgeImage: 'Badge image (optional)',
    badgeImageUpload: 'Upload badge image (optional)',
    badgeDescription: 'Badge appears at the top-left of the link preview with a pulse animation.',

    // Divider
    sizeLabel: 'Element size (50% ~ 200%)',
    dividerDescription: 'Cute divider for separating sections in GitHub README',

    // Style labels
    dots: 'Dots',
    dashes: 'Dashes',
    stars: 'Stars',
    hearts: 'Hearts',
    sparkles: 'Sparkles',

    // Preview
    missingValuePrefix: 'Please enter',
    missingValueSuffix: '!',
    enterUrlPrefix: 'Please enter',
    enterUrlSuffix: '!',

    // Copy Button
    copied: '✓ Copied',
    copyToClipboard: 'Copy to clipboard',
  },
} as const;

export type Locale = keyof typeof translations;
export type TranslationKey = keyof typeof translations.ko;
