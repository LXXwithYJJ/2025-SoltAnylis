// 表示[begin, end)间的年份，`begin`必须小于等于`end`
export interface YearRange {
  begin: number;
  end: number;
}

// 分页请求
export interface Pagination {
  // 要请求的页码
  page: number;
  // 每页数量，必须小于等于100！
  size: number;
}

// 成果检索排序要求
export interface OutputSortingCriteria {
  // 排序的条件，"citation"表示被引次数，"publishDate"表示发表/公开时间，"relevance"表示相关度
  field: "citation" | "publishDate" | "relevance";
  // "asc"按选定属性升序，"desc"按选定属性降序
  order: "asc" | "desc";
}

export interface CriteriaRequest {
  // 若该查询条件由LLM生成，则该字段不为空，此处包含用户的原始提示词；若该查询条件由用户手动选取，则该字段为空
  rawQuery?: string;

  // 要检索的成果类型，例如，["论文", "专利"]
  // 可为空！若为空，表示检索所有成果类型
  // 注意：此处的"空"指的是`{}`（长度为0的数组），不是`null`、`undefined`！
  outputTypeList: string[];

  // 要检索的学科，键为一级学科，对应的值为列表，列表中每一项表示该一级学科之下要检索的二级学科
  subjectList: Record<string, string[]>;

  // 要检索的年份区间
  publishYearRange?: YearRange;

  // 要检索的机构名称
  // 可为空！若为空，表示检索所有机构
  institutionList: string[];

  // 标题、关键词、摘要检索，该参数同时在标题、关键词、摘要中匹配
  content?: string;

  pagination: Pagination;

  sortBy: OutputSortingCriteria;
}

// 分页的检索结果
export interface PageResult<T = SearchSummaryItem> {
  content: T[];

  // 本页数据数量
  size: number;
  // 总计元素个数
  totalElements: number;
  // 总计页数
  totalPages: number;
  // 这些数据是第几页的数据，0下标
  number: number;
  // 是否是第一页
  first: boolean;
  // 是否是最后一页
  last: boolean;
}

export interface SearchSummaryScholarItem {
  // 学者姓名，例如"浩然"
  scholarName: string;
  // 学者UUID，该UUID用于在本系统内唯一标识学者
  scholarUuid: string;
  // 学者的ORCID
  orcid?: string;
  // 学者职称，例如："教授"
  scholarTitle?: string;

  // 学者所属机构名称，例如"武汉大学"
  institutionName: string;
  // 学者所属机构UUID
  institutionUuid: string;
}

export interface SearchSummaryItem {
  // 成果名称
  outputName: string;
  // 成果的UUID
  outputUuid: string;
  // 成果类型
  outputType: "article" | "patent" | "award";

  // 作者列表
  authorList: SearchSummaryScholarItem[];
  // 收录"日期"
  indexDate: string;

  // 相关度
  relevance: number;

  // 是否可获取引用格式文本
  citationTextAvailable: boolean;
}

export interface ArticleSummaryItem extends SearchSummaryItem {
  outputType: "article";
  // 收录期刊
  journal: string;
  // 被引次数
  citation: number;

  // 关键词
  keywords: string[];

  // 摘要
  abstract: string;
}

export interface PatentSummaryItem extends SearchSummaryItem {
  outputType: "patent";

  // 专利号（申请号）
  patentId: string;

  // 公开"日期"
  publishDate: string;

  // 关键词
  keywords: string[];

  // 摘要
  abstract: string;
}

export interface AwardSummaryItem extends SearchSummaryItem {
  outputType: "award";
}

export interface SearchResponse {
  // 检索结果
  pageResult: PageResult;

  // 相关推荐:聚类、向量查询推荐相关文章
  recommendationList: SearchSummaryItem[];
}

// 获取引用格式文本的URL参数
export interface CitationTextURLParams {
  // 成果的UUID，该UUID用于在本系统内唯一标识成果，例如"98641be2-73ca-4a11-ae17-7119198b3e07"
  outputUuid: string;
}
