<template>
  <div class="search-view">
    <n-space vertical :size="24">
      <!-- 搜索区域 -->
      <n-card title="成果检索" :bordered="false" size="large">
        <n-space vertical :size="16">
          <!-- 主搜索框 -->
          <n-input-group>
            <n-input
              v-model:value="searchForm.content"
              placeholder="输入关键词搜索标题、摘要或关键词..."
              size="large"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <n-icon :component="SearchOutline" />
              </template>
            </n-input>
            <n-button type="primary" size="large" @click="handleSearch" :loading="loading">
              搜索
            </n-button>
            <n-button size="large" @click="handleOpenHistory">
              <template #icon>
                <n-icon>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M13.5,8H12V13L16.28,15.54L17,14.33L13.5,12.25V8M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3Z" />
                  </svg>
                </n-icon>
              </template>
              检索历史
            </n-button>
          </n-input-group>

          <!-- 高级筛选 -->
          <n-collapse>
            <n-collapse-item title="高级筛选" name="advanced">
              <n-space vertical :size="12">
                <!-- 成果类型 -->
                <n-form-item label="成果类型">
                  <n-checkbox-group v-model:value="searchForm.outputTypeList">
                    <n-space>
                      <n-checkbox value="论文">论文</n-checkbox>
                      <n-checkbox value="专利">专利</n-checkbox>
                      <n-checkbox value="奖项">奖项</n-checkbox>
                    </n-space>
                  </n-checkbox-group>
                </n-form-item>

                <!-- 年份范围 -->
                <n-form-item label="发表年份">
                  <n-space>
                    <n-input-number
                      v-model:value="yearBegin"
                      placeholder="起始年份"
                      :min="1900"
                      :max="2100"
                      style="width: 150px"
                    />
                    <span>至</span>
                    <n-input-number
                      v-model:value="yearEnd"
                      placeholder="结束年份"
                      :min="1900"
                      :max="2100"
                      style="width: 150px"
                    />
                  </n-space>
                </n-form-item>

                <!-- 机构 -->
                <n-form-item label="研究机构">
                  <n-select
                    v-model:value="searchForm.institutionList"
                    multiple
                    placeholder="选择机构"
                    :options="institutionOptions"
                    clearable
                  />
                </n-form-item>

                <!-- 排序方式 -->
                <n-form-item label="排序方式">
                  <n-space>
                    <n-select
                      v-model:value="searchForm.sortBy.field"
                      :options="sortFieldOptions"
                      style="width: 150px"
                    />
                    <n-select
                      v-model:value="searchForm.sortBy.order"
                      :options="sortOrderOptions"
                      style="width: 120px"
                    />
                  </n-space>
                </n-form-item>
              </n-space>
            </n-collapse-item>
          </n-collapse>
        </n-space>
      </n-card>

      <!-- 搜索结果 -->
      <n-card v-if="searchResult" title="搜索结果" :bordered="false">
        <template #header-extra>
          <n-space align="center">
            <n-tag v-if="isUsingMockData" type="warning" size="small">
              <template #icon>
                <n-icon>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                  </svg>
                </n-icon>
              </template>
              演示数据
            </n-tag>
            <n-text depth="3">共找到 {{ searchResult.pageResult.totalElements }} 条结果</n-text>
          </n-space>
        </template>

        <n-space vertical :size="16">
          <!-- 结果列表 -->
          <n-list hoverable clickable>
            <n-list-item v-for="item in searchResult.pageResult.content" :key="item.outputUuid">
              <template #prefix>
                <n-tag :type="getOutputTypeColor(item.outputType)" size="small">
                  {{ getOutputTypeName(item.outputType) }}
                </n-tag>
              </template>

              <n-thing>
                <template #header>
                  <n-text strong style="font-size: 16px">{{ item.outputName }}</n-text>
                </template>

                <template #description>
                  <n-space vertical :size="4">
                    <n-text depth="3">
                      作者: {{ item.authorList.map((a: any) => `${a.scholarName}(${a.institutionName})`).join(', ') }}
                    </n-text>
                    <n-text depth="3">收录日期: {{ item.indexDate }}</n-text>

                    <!-- 论文特有字段 -->
                    <template v-if="item.outputType === 'article'">
                      <n-text depth="3">期刊: {{ (item as ArticleSummaryItem).journal }}</n-text>
                      <n-text depth="3">被引次数: {{ (item as ArticleSummaryItem).citation }}</n-text>
                      <n-space>
                        <n-tag
                          v-for="keyword in (item as ArticleSummaryItem).keywords"
                          :key="keyword"
                          size="small"
                          type="info"
                        >
                          {{ keyword }}
                        </n-tag>
                      </n-space>
                      <n-text depth="3" class="abstract">摘要: {{ (item as ArticleSummaryItem).abstract }}</n-text>
                    </template>

                    <!-- 专利特有字段 -->
                    <template v-if="item.outputType === 'patent'">
                      <n-text depth="3">专利号: {{ (item as PatentSummaryItem).patentId }}</n-text>
                      <n-text depth="3">公开日期: {{ (item as PatentSummaryItem).publishDate }}</n-text>
                      <n-space>
                        <n-tag
                          v-for="keyword in (item as PatentSummaryItem).keywords"
                          :key="keyword"
                          size="small"
                          type="info"
                        >
                          {{ keyword }}
                        </n-tag>
                      </n-space>
                      <n-text depth="3" class="abstract">摘要: {{ (item as PatentSummaryItem).abstract }}</n-text>
                    </template>
                  </n-space>
                </template>

                <template #footer>
                  <n-space align="center">
                    <n-tag size="small" type="warning">相关度: {{ (item.relevance * 100).toFixed(1) }}%</n-tag>
                    <n-tag v-if="item.citationTextAvailable" size="small" type="success">可引用</n-tag>
                    <n-button
                      v-if="item.citationTextAvailable"
                      size="small"
                      type="primary"
                      @click="handleGetCitation(item.outputUuid, item.outputName)"
                    >
                      <template #icon>
                        <n-icon>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M14,17H17L19,13V7H13V13H16M6,17H9L11,13V7H5V13H8L6,17Z" />
                          </svg>
                        </n-icon>
                      </template>
                      获取引用
                    </n-button>
                  </n-space>
                </template>
              </n-thing>
            </n-list-item>
          </n-list>

          <!-- 分页 -->
          <n-pagination
            v-model:page="currentPage"
            v-model:page-size="pageSize"
            :page-count="searchResult.pageResult.totalPages"
            :page-sizes="[10, 20, 50]"
            show-size-picker
            @update:page="handlePageChange"
            @update:page-size="handlePageSizeChange"
          />
        </n-space>
      </n-card>

      <!-- 相关推荐 -->
      <n-card v-if="searchResult && searchResult.recommendationList.length > 0" title="相关推荐" :bordered="false">
        <n-space vertical :size="12">
          <n-card
            v-for="item in searchResult.recommendationList"
            :key="item.outputUuid"
            size="small"
            hoverable
          >
            <n-space vertical :size="8">
              <n-space align="center">
                <n-tag :type="getOutputTypeColor(item.outputType)" size="small">
                  {{ getOutputTypeName(item.outputType) }}
                </n-tag>
                <n-text strong>{{ item.outputName }}</n-text>
              </n-space>
              <n-text depth="3" style="font-size: 12px">
                {{ item.authorList.map((a: any) => a.scholarName).join(', ') }} | {{ item.indexDate }}
              </n-text>
            </n-space>
          </n-card>
        </n-space>
      </n-card>

      <!-- 统计图表 -->
      <n-card v-if="searchResult && searchResult.pageResult.content.length > 0" title="统计分析" :bordered="false">
        <n-grid :cols="2" :x-gap="16">
          <n-grid-item>
            <v-chart :option="typeChartOption" style="height: 300px" />
          </n-grid-item>
          <n-grid-item>
            <v-chart :option="yearChartOption" style="height: 300px" />
          </n-grid-item>
        </n-grid>
      </n-card>
    </n-space>

    <!-- 引用文本弹窗 -->
    <n-modal
      v-model:show="showCitationModal"
      preset="card"
      :title="`引用格式 - ${currentCitation.outputName}`"
      style="width: 700px"
      :bordered="false"
      size="huge"
    >
      <n-spin :show="citationLoading">
        <n-space vertical :size="16">
          <!-- Mock 数据提示 -->
          <n-alert
            v-if="currentCitation.isMockData && !citationLoading"
            type="warning"
            title="演示数据"
            closable
          >
            当前显示的是模拟引用文本，等待后端服务接入后将显示真实数据
          </n-alert>

          <!-- 引用文本 -->
          <n-card
            v-if="currentCitation.text"
            size="small"
            :bordered="true"
            style="background-color: #f9f9f9"
          >
            <n-text
              style="
                font-family: 'Times New Roman', '宋体', serif;
                line-height: 1.8;
                font-size: 15px;
                display: block;
                word-break: break-word;
              "
            >
              {{ currentCitation.text }}
            </n-text>
          </n-card>

          <!-- 操作按钮 -->
          <n-space justify="end">
            <n-button @click="showCitationModal = false">关闭</n-button>
            <n-button
              type="primary"
              :disabled="!currentCitation.text"
              @click="handleCopyCitation"
            >
              <template #icon>
                <n-icon>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"
                    />
                  </svg>
                </n-icon>
              </template>
              复制引用
            </n-button>
          </n-space>
        </n-space>
      </n-spin>
    </n-modal>

    <!-- 检索历史弹窗 -->
    <n-modal
      v-model:show="showHistoryModal"
      preset="card"
      title="检索历史"
      style="width: 900px"
      :bordered="false"
      size="huge"
    >
      <n-spin :show="historyLoading">
        <n-space vertical :size="16">
          <!-- Mock 数据提示 -->
          <n-alert
            v-if="isUsingHistoryMockData && !historyLoading"
            type="warning"
            title="演示数据"
            closable
          >
            当前显示的是模拟检索历史，等待后端服务接入后将显示真实数据
          </n-alert>

          <!-- 历史记录列表 -->
          <n-empty
            v-if="searchHistory.length === 0 && !historyLoading"
            description="暂无检索历史"
          />

          <n-list v-else hoverable>
            <n-list-item v-for="record in searchHistory" :key="record.uuid">
              <n-space vertical :size="8">
                <!-- 如果有LLM原始提示词，显示它 -->
                <n-tag v-if="record.rawQuery" type="info" size="small">
                  <template #icon>
                    <n-icon>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M6,9H18V11H6M14,14H6V12H14M18,8H6V6H18" />
                      </svg>
                    </n-icon>
                  </template>
                  智能检索
                </n-tag>

                <!-- 显示搜索时间 -->
                <n-text depth="3" style="font-size: 12px">
                  检索时间: {{ formatSearchTime(record.searchTime) }}
                </n-text>

                <!-- 显示原始提示词 -->
                <n-text v-if="record.rawQuery" strong style="font-size: 14px">
                  "{{ record.rawQuery }}"
                </n-text>

                <!-- 显示搜索条件 -->
                <n-space :size="8">
                  <n-text depth="3">搜索条件:</n-text>
                  
                  <n-tag v-if="record.searchCriteria.content" size="small" type="default">
                    关键词: {{ record.searchCriteria.content }}
                  </n-tag>

                  <n-tag
                    v-if="record.searchCriteria.outputTypeList.length > 0"
                    size="small"
                    type="info"
                  >
                    类型: {{ record.searchCriteria.outputTypeList.join(', ') }}
                  </n-tag>

                  <n-tag
                    v-if="record.searchCriteria.institutionList.length > 0"
                    size="small"
                    type="success"
                  >
                    机构: {{ record.searchCriteria.institutionList.join(', ') }}
                  </n-tag>

                  <n-tag
                    v-if="record.searchCriteria.publishYearRange"
                    size="small"
                    type="warning"
                  >
                    年份: {{ record.searchCriteria.publishYearRange.begin }} - {{ record.searchCriteria.publishYearRange.end }}
                  </n-tag>

                  <n-tag size="small">
                    排序: {{ 
                      record.searchCriteria.sortBy.field === 'citation' ? '被引次数' :
                      record.searchCriteria.sortBy.field === 'publishDate' ? '发表时间' : '相关度'
                    }} ({{ record.searchCriteria.sortBy.order === 'asc' ? '升序' : '降序' }})
                  </n-tag>
                </n-space>

                <!-- 操作按钮 -->
                <n-space>
                  <n-button
                    size="small"
                    type="primary"
                    @click="handleRestoreSearch(record)"
                  >
                    <template #icon>
                      <n-icon>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M13,3A9,9 0 0,0 4,12H1L4.89,15.89L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3Z" />
                        </svg>
                      </n-icon>
                    </template>
                    恢复此搜索
                  </n-button>
                </n-space>
              </n-space>
            </n-list-item>
          </n-list>

          <!-- 分页 -->
          <n-pagination
            v-if="historyTotalPages > 1"
            v-model:page="historyPage"
            :page-count="historyTotalPages"
            :page-size="historyPageSize"
            @update:page="handleHistoryPageChange"
            style="display: flex; justify-content: center"
          />
        </n-space>
      </n-spin>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { SearchOutline } from '@vicons/ionicons5';
import { useMessage } from 'naive-ui';
import type { ArticleSummaryItem, PatentSummaryItem, SearchResponse, CriteriaRequest, SearchRecord } from '@/types/search';
import { searchByCriteria, getCitationText, getSearchHistory, type ApiResponse } from '@/api/search';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart, BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import VChart from 'vue-echarts';

use([CanvasRenderer, PieChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent]);

// 消息提示
const message = useMessage();

// 搜索表单
const searchForm = reactive({
  content: '',
  outputTypeList: [] as string[],
  institutionList: [] as string[],
  sortBy: {
    field: 'relevance' as 'citation' | 'publishDate' | 'relevance',
    order: 'desc' as 'asc' | 'desc',
  },
});

const yearBegin = ref<number | null>(null);
const yearEnd = ref<number | null>(null);

// 分页
const currentPage = ref(1);
const pageSize = ref(10);

// 搜索结果
const searchResult = ref<SearchResponse | null>(null);
const loading = ref(false);
const isUsingMockData = ref(false); // 标记是否使用了Mock数据

// 引用文本相关
const showCitationModal = ref(false);
const citationLoading = ref(false);
const currentCitation = ref({
  outputName: '',
  text: '',
  isMockData: false,
});

// 检索历史相关
const showHistoryModal = ref(false);
const historyLoading = ref(false);
const searchHistory = ref<SearchRecord[]>([]);
const historyPage = ref(0);
const historyPageSize = ref(10);
const historyTotalElements = ref(0);
const historyTotalPages = ref(0);
const isUsingHistoryMockData = ref(false);

// 机构选项
const institutionOptions = [
  { label: '北京航空航天大学', value: '北京航空航天大学' },
  { label: '清华大学', value: '清华大学' },
  { label: '中国科学院', value: '中国科学院' },
  { label: '华为技术有限公司', value: '华为技术有限公司' },
];

// 排序字段选项
const sortFieldOptions = [
  { label: '相关度', value: 'relevance' },
  { label: '被引次数', value: 'citation' },
  { label: '发表时间', value: 'publishDate' },
];

// 排序顺序选项
const sortOrderOptions = [
  { label: '升序', value: 'asc' },
  { label: '降序', value: 'desc' },
];

// 执行搜索
const handleSearch = async () => {
  loading.value = true;
  isUsingMockData.value = false;
  
  try {
    const request: CriteriaRequest = {
      content: searchForm.content || undefined,
      outputTypeList: searchForm.outputTypeList,
      subjectList: {},
      institutionList: searchForm.institutionList,
      publishYearRange:
        yearBegin.value && yearEnd.value
          ? { begin: yearBegin.value, end: yearEnd.value }
          : undefined,
      pagination: {
        page: currentPage.value - 1, // 转换为0下标
        size: pageSize.value,
      },
      sortBy: searchForm.sortBy,
    };

    // 调用API（内部会自动处理失败并使用mock数据兜底）
    const response: ApiResponse<SearchResponse> = await searchByCriteria(request);
    searchResult.value = response.data;
    isUsingMockData.value = response.isMockData;
    
    // 如果使用了Mock数据，提示用户
    if (response.isMockData) {
      message.info('当前使用演示数据，等待后端服务接入后将显示真实数据', {
        duration: 3000,
      });
    }
    
  } catch (error) {
    // 这里只处理意外错误（理论上不应该到这里，因为API函数内部已经处理了错误）
    console.error('搜索出现意外错误:', error);
    message.error('搜索失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page;
  handleSearch();
};

const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  handleSearch();
};

// 获取成果类型名称
const getOutputTypeName = (type: string) => {
  const map: Record<string, string> = {
    article: '论文',
    patent: '专利',
    award: '奖项',
  };
  return map[type] || type;
};

// 获取成果类型颜色
const getOutputTypeColor = (type: string) => {
  const map: Record<string, 'info' | 'success' | 'warning'> = {
    article: 'info',
    patent: 'success',
    award: 'warning',
  };
  return map[type] || 'default';
};

// 获取引用文本
const handleGetCitation = async (outputUuid: string, outputName: string) => {
  citationLoading.value = true;
  showCitationModal.value = true;
  currentCitation.value = {
    outputName,
    text: '',
    isMockData: false,
  };

  try {
    const response = await getCitationText(outputUuid);
    currentCitation.value.text = response.data;
    currentCitation.value.isMockData = response.isMockData;

    if (response.isMockData) {
      message.info('当前显示的是演示引用文本', { duration: 2000 });
    }
  } catch (error) {
    message.error('获取引用文本失败');
    showCitationModal.value = false;
  } finally {
    citationLoading.value = false;
  }
};

// 复制引用文本
const handleCopyCitation = async () => {
  if (!currentCitation.value.text) return;

  try {
    await navigator.clipboard.writeText(currentCitation.value.text);
    message.success('引用文本已复制到剪贴板');
  } catch (error) {
    message.error('复制失败，请手动复制');
  }
};

// 加载检索历史
const loadSearchHistory = async () => {
  historyLoading.value = true;
  try {
    const response = await getSearchHistory(historyPage.value, historyPageSize.value);
    searchHistory.value = response.data.content;
    historyTotalElements.value = response.data.totalElements;
    historyTotalPages.value = response.data.totalPages;
    isUsingHistoryMockData.value = response.isMockData;

    if (response.isMockData) {
      message.info('当前显示的是演示历史数据', { duration: 2000 });
    }
  } catch (error) {
    message.error('加载检索历史失败');
    console.error('加载检索历史失败:', error);
  } finally {
    historyLoading.value = false;
  }
};

// 打开检索历史弹窗
const handleOpenHistory = () => {
  showHistoryModal.value = true;
  loadSearchHistory();
};

// 历史记录分页变化
const handleHistoryPageChange = (page: number) => {
  historyPage.value = page - 1; // 转换为0下标
  loadSearchHistory();
};

// 从历史记录恢复搜索
const handleRestoreSearch = (record: SearchRecord) => {
  // 恢复搜索条件
  searchForm.content = record.searchCriteria.content || '';
  searchForm.outputTypeList = record.searchCriteria.outputTypeList;
  searchForm.institutionList = record.searchCriteria.institutionList;
  searchForm.sortBy = record.searchCriteria.sortBy;
  
  if (record.searchCriteria.publishYearRange) {
    yearBegin.value = record.searchCriteria.publishYearRange.begin;
    yearEnd.value = record.searchCriteria.publishYearRange.end;
  } else {
    yearBegin.value = null;
    yearEnd.value = null;
  }

  // 关闭弹窗
  showHistoryModal.value = false;
  
  // 执行搜索
  message.info('已恢复历史搜索条件');
  handleSearch();
};

// 格式化时间
const formatSearchTime = (timeString?: string) => {
  if (!timeString) return '未知时间';
  const date = new Date(timeString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 组件挂载时可以预加载历史数据（可选）
// onMounted(() => {
//   loadSearchHistory();
// });

// 成果类型统计图表
const typeChartOption = computed(() => {
  if (!searchResult.value) return {};

  const data = searchResult.value.pageResult.content;
  const typeCounts: Record<string, number> = {};

  data.forEach((item) => {
    const typeName = getOutputTypeName(item.outputType);
    typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
  });

  return {
    title: { text: '成果类型分布', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '成果类型',
        type: 'pie',
        radius: '50%',
        data: Object.entries(typeCounts).map(([name, value]) => ({ name, value })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };
});

// 年份统计图表
const yearChartOption = computed(() => {
  if (!searchResult.value) return {};

  const data = searchResult.value.pageResult.content;
  const yearCounts: Record<string, number> = {};

  data.forEach((item) => {
    const year = item.indexDate.split('-')[0]!;
    yearCounts[year] = (yearCounts[year] || 0) + 1;
  });

  const years = Object.keys(yearCounts).sort();
  const counts = years.map((year) => yearCounts[year]);

  return {
    title: { text: '年份分布', left: 'center' },
    tooltip: { trigger: 'axis' },
    grid: { left: '10%', right: '10%', bottom: '15%' },
    xAxis: { type: 'category', data: years },
    yAxis: { type: 'value' },
    series: [
      {
        name: '数量',
        type: 'bar',
        data: counts,
        itemStyle: { color: '#18a058' },
      },
    ],
  };
});
</script>

<style scoped>
.search-view {
  padding: 24px;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

/* 响应式调整 */
@media (min-width: 1400px) {
  .search-view {
    max-width: 1400px;
  }
}

@media (max-width: 768px) {
  .search-view {
    padding: 16px;
  }
}

.abstract {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.n-card__content) {
  padding: 20px;
}

:deep(.n-list-item__main) {
  width: 100%;
}
</style>
