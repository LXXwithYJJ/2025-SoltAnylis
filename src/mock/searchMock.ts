import type { CriteriaRequest, SearchResponse, PageResult, SearchSummaryItem, ArticleSummaryItem, PatentSummaryItem, AwardSummaryItem, SearchRecordPageResult, SearchRecord } from '@/types/search';

// 生成mock数据
const generateMockArticles = (count: number): ArticleSummaryItem[] => {
  const articles: ArticleSummaryItem[] = [];
  const journals = ['Nature', 'Science', '计算机学报', '软件学报', 'IEEE Transactions', 'ACM Computing Surveys'];
  const keywords = ['深度学习', '机器学习', '人工智能', '数据挖掘', '计算机视觉', '自然语言处理', '软件分析', '程序理解'];
  
  for (let i = 0; i < count; i++) {
    articles.push({
      outputName: `基于深度学习的${keywords[i % keywords.length]}研究与应用 (${i + 1})`,
      outputUuid: `article-uuid-${i}`,
      outputType: 'article',
      authorList: [
        {
          scholarName: `学者${i + 1}`,
          scholarUuid: `scholar-uuid-${i}`,
          orcid: `0000-0001-${String(i).padStart(4, '0')}-${String(i * 100).padStart(4, '0')}`,
          scholarTitle: i % 3 === 0 ? '教授' : i % 3 === 1 ? '副教授' : '讲师',
          institutionName: i % 2 === 0 ? '北京航空航天大学' : '清华大学',
          institutionUuid: `institution-uuid-${i % 2}`,
        },
      ],
      indexDate: `202${3 - (i % 4)}-${String((i % 12) + 1).padStart(2, '0')}-15`,
      relevance: 0.95 - i * 0.01,
      citationTextAvailable: true,
      journal: journals[i % journals.length]!,
      citation: Math.floor(Math.random() * 500) + 10,
      keywords: [keywords[i % keywords.length]!, keywords[(i + 1) % keywords.length]!, keywords[(i + 2) % keywords.length]!],
      abstract: `这是一篇关于${keywords[i % keywords.length]}的研究论文，主要探讨了该领域的最新进展和应用。研究采用了创新的方法论，在多个基准数据集上取得了显著的性能提升。实验结果表明，所提出的方法在准确性、效率和可扩展性方面都优于现有技术。`,
    });
  }
  return articles;
};

const generateMockPatents = (count: number): PatentSummaryItem[] => {
  const patents: PatentSummaryItem[] = [];
  const keywords = ['图像处理', '数据安全', '云计算', '物联网', '区块链', '边缘计算'];
  
  for (let i = 0; i < count; i++) {
    patents.push({
      outputName: `一种基于${keywords[i % keywords.length]}的系统及方法`,
      outputUuid: `patent-uuid-${i}`,
      outputType: 'patent',
      authorList: [
        {
          scholarName: `发明人${i + 1}`,
          scholarUuid: `inventor-uuid-${i}`,
          scholarTitle: '高级工程师',
          institutionName: '华为技术有限公司',
          institutionUuid: `company-uuid-${i % 3}`,
        },
      ],
      indexDate: `202${3 - (i % 4)}-${String((i % 12) + 1).padStart(2, '0')}-20`,
      relevance: 0.90 - i * 0.015,
      citationTextAvailable: false,
      patentId: `CN2025${String(11211678 + i).padStart(8, '0')}.${i % 10}`,
      publishDate: `202${3 - (i % 4)}-${String((i % 12) + 1).padStart(2, '0')}-20`,
      keywords: [keywords[i % keywords.length]!, keywords[(i + 1) % keywords.length]!],
      abstract: `本发明公开了一种${keywords[i % keywords.length]}技术方案，能够有效解决现有技术中存在的问题，提高系统性能和用户体验。`,
    });
  }
  return patents;
};

const generateMockAwards = (count: number): AwardSummaryItem[] => {
  const awards: AwardSummaryItem[] = [];
  
  for (let i = 0; i < count; i++) {
    awards.push({
      outputName: `国家科技进步${i % 3 === 0 ? '一等' : i % 3 === 1 ? '二等' : '三等'}奖`,
      outputUuid: `award-uuid-${i}`,
      outputType: 'award',
      authorList: [
        {
          scholarName: `获奖者${i + 1}`,
          scholarUuid: `winner-uuid-${i}`,
          scholarTitle: '院士',
          institutionName: '中国科学院',
          institutionUuid: `institution-uuid-${i}`,
        },
      ],
      indexDate: `202${3 - (i % 4)}-01-10`,
      relevance: 0.85 - i * 0.02,
      citationTextAvailable: false,
    });
  }
  return awards;
};

// 模拟搜索API
export const mockSearchByCriteria = async (request: CriteriaRequest): Promise<SearchResponse> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 生成所有mock数据
  const allArticles = generateMockArticles(50);
  const allPatents = generateMockPatents(30);
  const allAwards = generateMockAwards(10);

  let allData: SearchSummaryItem[] = [];

  // 根据成果类型筛选
  if (request.outputTypeList.length === 0) {
    allData = [...allArticles, ...allPatents, ...allAwards];
  } else {
    if (request.outputTypeList.includes('论文')) {
      allData.push(...allArticles);
    }
    if (request.outputTypeList.includes('专利')) {
      allData.push(...allPatents);
    }
    if (request.outputTypeList.includes('奖项')) {
      allData.push(...allAwards);
    }
  }

  // 根据内容筛选
  if (request.content) {
    const searchTerm = request.content.toLowerCase();
    allData = allData.filter(item => {
      const nameMatch = item.outputName.toLowerCase().includes(searchTerm);
      const keywordsMatch = 'keywords' in item && (item as ArticleSummaryItem | PatentSummaryItem).keywords.some((k: string) => k.toLowerCase().includes(searchTerm));
      const abstractMatch = 'abstract' in item && (item as ArticleSummaryItem | PatentSummaryItem).abstract.toLowerCase().includes(searchTerm);
      return nameMatch || keywordsMatch || abstractMatch;
    });
  }

  // 根据年份筛选
  if (request.publishYearRange) {
    allData = allData.filter(item => {
      const year = parseInt(item.indexDate.split('-')[0]!);
      return year >= request.publishYearRange!.begin && year < request.publishYearRange!.end;
    });
  }

  // 根据机构筛选
  if (request.institutionList.length > 0) {
    allData = allData.filter(item => {
      return item.authorList.some(author => 
        request.institutionList.includes(author.institutionName)
      );
    });
  }

  // 排序
  allData.sort((a, b) => {
    const { field, order } = request.sortBy;
    let comparison = 0;

    if (field === 'citation') {
      const aCitation = 'citation' in a ? (a as ArticleSummaryItem).citation : 0;
      const bCitation = 'citation' in b ? (b as ArticleSummaryItem).citation : 0;
      comparison = aCitation - bCitation;
    } else if (field === 'publishDate') {
      comparison = new Date(a.indexDate).getTime() - new Date(b.indexDate).getTime();
    } else if (field === 'relevance') {
      comparison = a.relevance - b.relevance;
    }

    return order === 'asc' ? comparison : -comparison;
  });

  // 分页
  const { page, size } = request.pagination;
  const start = page * size;
  const end = start + size;
  const pageContent = allData.slice(start, end);

  const pageResult: PageResult = {
    content: pageContent,
    size: pageContent.length,
    totalElements: allData.length,
    totalPages: Math.ceil(allData.length / size),
    number: page,
    first: page === 0,
    last: end >= allData.length,
  };

  // 生成推荐列表（取前5个不同的结果）
  const recommendationList = allData.slice(0, 5);

  return {
    pageResult,
    recommendationList,
  };
};

// 生成模拟的引用格式文本
export const mockGetCitationText = async (outputUuid: string): Promise<string> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 模拟各种不同格式的引用文本
  const citationFormats = [
    `张三, 李四, 王五. 基于深度学习的图像识别研究[J]. 计算机学报, 2023, 46(5): 123-135.`,
    `Smith J, Johnson M, Brown K. Advanced Machine Learning Techniques for Data Analysis[J]. IEEE Transactions on Neural Networks, 2023, 34(2): 456-478. DOI: 10.1109/TNN.2023.123456`,
    `王明, 刘华. 人工智能在医疗诊断中的应用研究[J]. 软件学报, 2022, 33(8): 2345-2367.`,
    `Chen L, Zhang Y, Liu X. Deep Learning Based Natural Language Processing: A Survey[C]//Proceedings of the 2023 International Conference on Artificial Intelligence. ACM, 2023: 89-97.`,
    `赵六, 孙七. 云计算环境下的数据安全保护技术[J]. 通信学报, 2023, 44(3): 78-90. DOI: 10.11959/j.issn.1000-436x.2023056`,
  ];

  // 根据UUID返回不同的引用文本（模拟不同的成果）
  const hash = outputUuid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const format = citationFormats[hash % citationFormats.length]!;

  return format;
};

// 生成模拟的检索条件数据
export const mockGetCriteriaData = async (): Promise<import('@/types/search').CriteriaData> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    outputTypeInfo: {
      '论文': 12450,
      '专利': 8320,
      '奖项': 156,
    },
    subjectInfo: {
      '计算机科学与技术': {
        '计算机系统结构': 2345,
        '计算机软件与理论': 3456,
        '计算机应用技术': 4567,
      },
      '软件工程': {
        '软件工程理论与方法': 1234,
        '软件工程技术': 2345,
        '软件服务工程': 1123,
      },
      '网络空间安全': {
        '密码学': 890,
        '系统安全': 1234,
        '网络安全': 1456,
      },
    },
    institutionInfo: {
      '北京航空航天大学': 3456,
      '清华大学': 4567,
      '中国科学院': 5678,
      '华为技术有限公司': 2345,
    },
  };
};

// 生成模拟的检索历史数据
export const mockGetSearchHistory = async (page: number = 0, size: number = 10): Promise<SearchRecordPageResult> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 生成模拟的历史记录
  const allRecords: SearchRecord[] = [];
  const keywords = ['深度学习', '机器学习', '人工智能', '数据挖掘', '计算机视觉', '自然语言处理', '软件分析', '云计算', '区块链', '物联网'];
  const institutions = ['北京航空航天大学', '清华大学', '中国科学院', '华为技术有限公司'];
  
  // 生成15条历史记录
  for (let i = 0; i < 15; i++) {
    const hasRawQuery = i % 3 === 0; // 每3条记录有一条是使用LLM智能检索的
    const outputTypes = i % 2 === 0 ? ['论文'] : i % 3 === 0 ? ['论文', '专利'] : ['专利'];
    const selectedInstitutions = i % 4 === 0 ? [institutions[i % institutions.length]!] : [];
    
    const record: SearchRecord = {
      uuid: `history-uuid-${i}`,
      rawQuery: hasRawQuery ? `请帮我找一些关于${keywords[i % keywords.length]}的最新研究成果` : undefined,
      searchCriteria: {
        content: keywords[i % keywords.length],
        outputTypeList: outputTypes,
        subjectList: {},
        institutionList: selectedInstitutions,
        publishYearRange: i % 5 === 0 ? { begin: 2020, end: 2023 } : undefined,
        pagination: {
          page: 0,
          size: 10,
        },
        sortBy: {
          field: i % 3 === 0 ? 'citation' : i % 3 === 1 ? 'publishDate' : 'relevance',
          order: 'desc',
        },
      },
      searchTime: new Date(Date.now() - i * 86400000).toISOString(), // 每条记录间隔1天
    };
    
    allRecords.push(record);
  }

  // 分页处理
  const startIndex = page * size;
  const endIndex = Math.min(startIndex + size, allRecords.length);
  const pageContent = allRecords.slice(startIndex, endIndex);
  const totalPages = Math.ceil(allRecords.length / size);

  return {
    content: pageContent,
    size: pageContent.length,
    totalElements: allRecords.length,
    totalPages,
    number: page,
    first: page === 0,
    last: page >= totalPages - 1,
  };
};
