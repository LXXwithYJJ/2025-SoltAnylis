import type { CriteriaRequest, SearchResponse, PageResult, SearchSummaryItem, ArticleSummaryItem, PatentSummaryItem, AwardSummaryItem } from '@/types/search';

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
