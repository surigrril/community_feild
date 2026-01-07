import { useState, useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { 
  MessageCircle, ThumbsUp, Lock, CheckCircle2, Zap, Settings, 
  ArrowLeft, Users, Search, Bell, Clock, Calendar, Filter, Star, AlertTriangle,
  PlusCircle, PenLine, TrendingUp, History, User, Check, ChevronRight, ChevronLeft
} from 'lucide-react';

// Chart.js 등록
ChartJS.register(ArcElement, Tooltip, Legend);

// --- [유틸리티] 랜덤 닉네임 생성기 ---
const getRandomProfile = () => {
  const adjs = ['신난', '배고픈', '졸린', '용감한', '똑똑한', '행복한', '즐거운', '수줍은', '엉뚱한'];
  const nouns = ['초등학생', '어린이', '친구', '단짝', '지킴이', '박사님', '탐험가', '요리사'];
  return {
    name: `${adjs[Math.floor(Math.random() * adjs.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`,
    colorClass: ['text-red-500', 'text-orange-500', 'text-green-600', 'text-blue-500', 'text-purple-500'][Math.floor(Math.random() * 5)]
  };
};

// --- [컴포넌트 1] 메인 방 리스트 화면 ---
const RoomList = ({ onSelectRoom, onGoToSuggest }) => {
  const [showClosed, setShowClosed] = useState(false); 
  const [activeFilters, setActiveFilters] = useState([]); 
  const [sortMode, setSortMode] = useState('newest'); 

  // 목업 데이터
  const rooms = [
    { 
      id: 105, 
      title: '수학여행 스타일, 너는 어때?', 
      content: '곧 수학여행 시즌이야! 너의 여행 스타일을 골라봐.\n나랑 딱 맞는 여행 메이트를 찾을 수 있을지도?',
      type: 'multi_choice_discuss', 
      tags: ['HOT', '수학여행', '밸런스게임'], 
      participants: 215, 
      comments: 68, 
      status: 'OPEN', 
      hasParticipated: false,
      bg: 'bg-teal-100',
      icon: '🚌',
      endDate: '10.28',
      createdAt: '2023-10-15',
      questions: [
        { id: 'q1', text: '버스 옆자리, 누가 좋아?', options: ['재밌는 수다쟁이 친구', '조용히 자는 친구'] },
        { id: 'q2', text: '자유시간에는?', options: ['계획대로 움직여', '발길 닿는 대로!'] },
        { id: 'q3', text: '숙소에 도착하면?', options: ['짐부터 정리해', '침대부터 누워'] },
        { id: 'q4', text: '기념품 살 때?', options: ['가성비가 최고', '이쁘면 다 사!'] },
      ]
    },
    { 
      id: 101, 
      title: '10월 급식 메뉴 월드컵', 
      content: '친구들! 10월 특식으로 뭐가 나오면 좋을까?\n가장 먹고 싶은 메뉴를 골라줘!',
      type: 'choice_discuss', 
      tags: ['급식', '메뉴추천'], 
      participants: 128, 
      comments: 45, 
      status: 'OPEN', 
      hasParticipated: true,
      bg: 'bg-orange-100',
      icon: '🍛',
      endDate: '10.25',
      createdAt: '2023-10-01',
      questions: [
        { id: 'q1', text: '가장 먹고 싶은 메뉴는?', options: ['치즈 돈가스', '토마토 스파게티', '산채 비빔밥'] }
      ]
    },
    { 
      id: 102, 
      title: '체육대회 반티 정하기', 
      content: '축구복은 너무 흔한가? 잠옷은 어때?\n우리 반의 멋진 반티를 골라줘!',
      type: 'choice', 
      tags: ['3학년', '체육대회'], 
      participants: 340, 
      comments: 0, 
      status: 'OPEN', 
      hasParticipated: false,
      bg: 'bg-blue-100',
      icon: '⚽️',
      endDate: '10.30',
      createdAt: '2023-10-05',
      questions: [
        { id: 'q1', text: '반티 후보 투표', options: ['축구 유니폼', '동물 잠옷', '죄수복', '한복'] }
      ]
    },
    { 
      id: 103, 
      title: '수학 시험 어땠어?', 
      content: '서술형 마지막 문제 진짜 어렵지 않았어?\n다들 어떻게 풀었는지 이야기해보자 ㅠㅠ',
      type: 'discuss', 
      tags: ['멘붕', '시험'], 
      participants: 82, 
      comments: 156, 
      status: 'OPEN', 
      hasParticipated: true, 
      bg: 'bg-purple-100',
      icon: '✏️',
      endDate: '상시',
      createdAt: '2023-10-08',
      questions: []
    },
    { 
      id: 104, 
      title: '[종료] 9월 모의고사 후기', 
      content: '다들 시험 보느라 고생했어!',
      type: 'discuss', 
      tags: ['지난이야기'], 
      participants: 56, 
      comments: 89, 
      status: 'CLOSED', 
      hasParticipated: true,
      bg: 'bg-gray-200',
      icon: '💯',
      endDate: '09.10',
      createdAt: '2023-09-10',
      questions: []
    },
  ];

  const allTags = [...new Set(rooms.filter(r => r.status === 'OPEN').flatMap(r => r.tags))];

  const toggleFilter = (filterId) => {
    setActiveFilters(prev => 
      prev.includes(filterId) ? prev.filter(id => id !== filterId) : [...prev, filterId]
    );
  };

  const getProcessedRooms = () => {
    let result = rooms.filter(room => showClosed ? room.status === 'CLOSED' : room.status === 'OPEN');

    if (activeFilters.length > 0) {
      result = result.filter(room => {
        return activeFilters.some(filterId => {
          if (filterId === 'PARTICIPATED') return room.hasParticipated;
          if (filterId === 'NOT_PARTICIPATED') return !room.hasParticipated;
          if (filterId.startsWith('TAG_')) return room.tags.includes(filterId.replace('TAG_', ''));
          return false;
        });
      });
    }

    result.sort((a, b) => {
      if (sortMode === 'popular') {
        return b.participants - a.participants;
      } else {
        return b.id - a.id; 
      }
    });

    return result;
  };

  const finalRoomList = getProcessedRooms();

  return (
    <div className="w-full max-w-md mx-auto bg-[#FFF9F0] h-full flex flex-col font-sans">
      <div className="bg-white px-5 pt-6 pb-4 sticky top-0 z-10 rounded-b-3xl shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs text-orange-400 font-extrabold tracking-wider">우리들의 이야기</span>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-800 tracking-tight">
                {showClosed ? '보물상자 (지난글)' : '와글와글 광장'}
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={onGoToSuggest} className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 active:scale-95 transition-transform">
               <PlusCircle className="w-6 h-6 mb-0.5" />
               <span className="text-[9px] font-bold">제안</span>
             </button>
             <button onClick={() => setShowClosed(!showClosed)} className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl border active:scale-95 transition-transform ${showClosed ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-400 border-gray-100'}`}>
               {showClosed ? <ArrowLeft className="w-6 h-6 mb-0.5" /> : <History className="w-6 h-6 mb-0.5" />}
               <span className="text-[9px] font-bold">{showClosed ? '돌아가기' : '지난이야기'}</span>
             </button>
          </div>
        </div>

        {!showClosed && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <button onClick={() => toggleFilter('PARTICIPATED')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${activeFilters.includes('PARTICIPATED') ? 'bg-green-100 border-green-200 text-green-700' : 'bg-white border-gray-100 text-gray-400'}`}>
                   ✅ 참여완료
                </button>
                <button onClick={() => toggleFilter('NOT_PARTICIPATED')} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${activeFilters.includes('NOT_PARTICIPATED') ? 'bg-orange-100 border-orange-200 text-orange-700' : 'bg-white border-gray-100 text-gray-400'}`}>
                   ✨ 미참여
                </button>
              </div>

              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button onClick={() => setSortMode('newest')} className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${sortMode === 'newest' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}>최신순</button>
                <button onClick={() => setSortMode('popular')} className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${sortMode === 'popular' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400'}`}>인기순</button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {allTags.map(tag => (
                <button key={tag} onClick={() => toggleFilter(`TAG_${tag}`)} className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${activeFilters.includes(`TAG_${tag}`) ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {finalRoomList.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>해당하는 방이 없어 😅</p>
          </div>
        ) : (
          finalRoomList.map(room => (
            <div 
              key={room.id} 
              onClick={() => onSelectRoom(room)}
              className={`rounded-3xl p-5 shadow-sm border-2 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden ${room.status === 'CLOSED' ? 'bg-gray-50 border-gray-200 grayscale opacity-80' : 'bg-white border-orange-100 hover:border-orange-300 hover:shadow-md'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-1.5 flex-wrap">
                  {room.hasParticipated ? (
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-black bg-green-100 text-green-600 flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3 h-3" /> 참여완료
                    </span>
                  ) : (
                    room.status === 'OPEN' && <span className="text-[10px] px-2.5 py-1 rounded-full font-black bg-red-100 text-red-500 shadow-sm">미참여 🔥</span>
                  )}
                  {room.status === 'CLOSED' && <span className="text-[10px] px-2.5 py-1 rounded-full font-black bg-gray-200 text-gray-500">마감</span>}
                </div>
                <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded-lg">{room.endDate} 까지</span>
              </div>

              <div className="flex gap-4 items-start">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${room.bg}`}>
                  {room.icon}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-black text-lg text-gray-800 leading-tight mb-1">{room.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1 font-medium">{room.content}</p>
                  
                  <div className="flex items-center gap-3 mt-3">
                     <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                       <Users className="w-3 h-3" /> {room.participants}명 참여
                     </span>
                     {room.comments > 0 && (
                        <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" /> {room.comments}
                        </span>
                     )}
                     {room.type === 'multi_choice_discuss' && (
                        <span className="text-[10px] text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded font-bold border border-teal-100">
                          밸런스게임
                        </span>
                     )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div className="h-10"></div>
      </div>
    </div>
  );
};

// --- [컴포넌트 2] 주제 제안하기 화면 ---
const SuggestTopic = ({ onBack }) => {
  const [suggestion, setSuggestion] = useState('');

  const handleSubmit = () => {
    if (!suggestion.trim()) return alert('내용을 입력해줘!');
    alert('제안해줘서 고마워! 선생님이 꼭 읽어볼게 😊');
    onBack();
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white h-full flex flex-col font-sans">
      <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-100">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h2 className="font-black text-lg text-gray-800">주제 제안하기</h2>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="bg-orange-50 p-5 rounded-2xl mb-6">
          <h3 className="font-bold text-orange-600 mb-2 flex items-center gap-2">
            <PenLine className="w-5 h-5" /> 어떤 이야기가 하고 싶어?
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            "급식 메뉴 정하고 싶어요!"<br/>
            "체육대회 종목 투표해요!"<br/>
            친구들과 나누고 싶은 주제가 있다면 자유롭게 적어줘.
          </p>
        </div>

        <textarea 
          className="w-full h-48 p-4 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-orange-300 focus:bg-white transition-colors outline-none resize-none text-gray-700 font-medium"
          placeholder="여기에 적어주면 돼!"
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
        ></textarea>

        <button 
          onClick={handleSubmit}
          className="mt-auto w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-lg shadow-md active:scale-95 transition-transform"
        >
          제안 보내기 💌
        </button>
      </div>
    </div>
  );
};

// --- [컴포넌트 3] 상세 이야기방 화면 ---
const DiscussionRoom = ({ roomData, onBack }) => {
  const isClosed = roomData.status === 'CLOSED';
  // 객관식이 포함된 방이면 초기 탭은 'vote', 토론만 있는 방은 'discuss'
  const initialTab = roomData.questions && roomData.questions.length > 0 ? 'vote' : 'discuss';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isVoted, setIsVoted] = useState(roomData.hasParticipated || isClosed); 
  
  // Step-by-Step 투표를 위한 현재 질문 인덱스
  const [currentQIdx, setCurrentQIdx] = useState(0);

  // 내 투표 상태 (단일 값 또는 객체)
  const [myVotes, setMyVotes] = useState({}); // { q1: '옵션1', q2: '옵션2' ... }
  
  // 필터: 'newest' | 'same_opinion' | 'popular' | 'my_comments'
  const [filterMode, setFilterMode] = useState('newest'); 
  const [commentInput, setCommentInput] = useState('');
  
  // 목업 투표 통계 데이터
  const [voteStats] = useState({ 
    '치즈 돈가스': 52, '토마토 스파게티': 38, '산채 비빔밥': 15,
    '축구 유니폼': 120, '동물 잠옷': 200, '죄수복': 50, '한복': 10,
    '재밌는 수다쟁이 친구': 100, '조용히 자는 친구': 115,
    '계획대로 움직여': 80, '발길 닿는 대로!': 135,
    '짐부터 정리해': 150, '침대부터 누워': 65,
    '가성비가 최고': 40, '이쁘면 다 사!': 175
  });

  // 목업 댓글 데이터 (voteProfile 추가)
  const [comments, setComments] = useState([
    { 
      id: 101, ...getRandomProfile(), isMe: false, timeStr: '15분 전', 
      voteProfile: { q1: '재밌는 수다쟁이 친구', q2: '계획대로 움직여', q3: '짐부터 정리해', q4: '가성비가 최고' },
      vote: '치즈 돈가스', // 단일 투표용 호환
      content: '난 계획 짜는 게 좋아! J니까!', likes: 12 
    },
    { 
      id: 102, ...getRandomProfile(), isMe: false, timeStr: '10분 전', 
      voteProfile: { q1: '조용히 자는 친구', q2: '발길 닿는 대로!', q3: '침대부터 누워', q4: '이쁘면 다 사!' },
      vote: '토마토 스파게티', 
      content: '여행은 쉬러 가는 거지~ 무조건 침대!', likes: 5 
    },
    { 
      id: 103, ...getRandomProfile(), isMe: true, timeStr: '1분 전', 
      voteProfile: { q1: '재밌는 수다쟁이 친구', q2: '발길 닿는 대로!', q3: '짐부터 정리해', q4: '이쁘면 다 사!' },
      vote: '치즈 돈가스',
      content: '나는 반반 섞인 스타일인듯 ㅋㅋ', likes: 2 
    }
  ]);

  const mode = roomData.type; 
  const questions = roomData.questions || [];
  const isMultiChoice = mode === 'multi_choice_discuss';

  const myProfile = useMemo(() => ({ name: '나 (익명)', colorClass: 'text-gray-800 font-bold' }), []); 

  // 투표 핸들러
  const handleVoteChange = (questionId, option) => {
    if (isClosed) return;
    setMyVotes(prev => ({ ...prev, [questionId]: option }));
    
    // 자동 넘김 로직 (마지막 문제가 아닐 때만)
    if (currentQIdx < questions.length - 1) {
      setTimeout(() => {
        setCurrentQIdx(prev => prev + 1);
      }, 300); // 0.3초 딜레이
    }
  };

  const goToPrevQuestion = () => {
    if (currentQIdx > 0) {
      setCurrentQIdx(prev => prev - 1);
    }
  };

  const submitVote = () => {
    // 모든 질문에 답했는지 확인
    const answeredCount = Object.keys(myVotes).length;
    if (answeredCount < questions.length) {
      return alert('아직 선택하지 않은 문제가 있어!');
    }
    setIsVoted(true);
    setCurrentQIdx(0); // 결과 볼 때는 처음부터 보기
  };

  const handleCommentSubmit = () => {
    if (isClosed) return;
    if (!commentInput.trim()) return alert("친구들에게 할 말을 적어줘!");
    
    const newComment = {
      id: Date.now(), ...myProfile, isMe: true, timeStr: '방금',
      timestamp: Date.now(), 
      vote: myVotes['q1'] || null, // 단일 투표 호환
      voteProfile: myVotes, // 다중 투표 데이터
      content: commentInput, likes: 0
    };
    setComments(prev => [newComment, ...prev]);
    setCommentInput('');
    setFilterMode('newest'); // 댓글 등록 후 최신순으로 이동
  };

  // --- [핵심 로직] 궁합 계산기 ---
  const calculateMatchScore = (commentVoteProfile) => {
    if (!isMultiChoice || !commentVoteProfile) return 0;
    if (Object.keys(myVotes).length === 0) return 0;
    
    let matchCount = 0;
    questions.forEach(q => {
      if (myVotes[q.id] === commentVoteProfile[q.id]) matchCount++;
    });
    
    return Math.round((matchCount / questions.length) * 100); 
  };

  const getMatchTag = (score) => {
    if (score === 100) return { text: '💯 운명이야!', color: 'bg-pink-100 text-pink-600' };
    if (score >= 75) return { text: '💖 꽤 잘맞아', color: 'bg-red-100 text-red-500' };
    if (score >= 50) return { text: '🤝 반반 치킨', color: 'bg-orange-100 text-orange-600' };
    if (score >= 25) return { text: '🤔 조금 달라', color: 'bg-blue-100 text-blue-500' };
    return { text: '🔥 정반대 매력', color: 'bg-gray-100 text-gray-500' };
  };

  // --- [필터 로직] ---
  const getFilteredComments = () => {
    let filtered = [...comments];

    if (filterMode === 'my_comments') {
      filtered = filtered.filter(c => c.isMe);
    } else if (filterMode === 'same_opinion') {
       if (!isMultiChoice) {
          filtered = filtered.filter(c => myVotes['q1'] && c.vote === myVotes['q1']);
       } else {
          filtered = filtered.filter(c => calculateMatchScore(c.voteProfile) >= 50);
          filtered.sort((a, b) => calculateMatchScore(b.voteProfile) - calculateMatchScore(a.voteProfile));
       }
    } else if (filterMode === 'popular') {
      filtered.sort((a, b) => b.likes - a.likes);
    }
    
    return filtered;
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#FFF9F0] h-full flex flex-col relative font-sans">
      {/* 상세 헤더 */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-3 sticky top-0 z-30 shadow-sm rounded-b-3xl">
        <button onClick={onBack} className="p-2 hover:bg-orange-50 rounded-full transition-colors text-gray-600">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 text-center">
            <span className="text-sm font-black text-gray-800 tracking-tight line-clamp-1">{roomData.title}</span>
        </div>
        <button className="p-2 text-gray-300">
             <AlertTriangle className="w-5 h-5" />
        </button>
      </div>

      {isClosed && (
        <div className="bg-gray-800 text-white text-xs px-4 py-3 text-center font-bold sticky top-[60px] z-20 shadow-md">
          🔒 문이 닫힌 방이야 (읽기만 가능해)
        </div>
      )}

      <div className="flex-1 overflow-y-auto relative">
        {/* 본문 카드 */}
        <div className="m-4 bg-white p-6 rounded-3xl shadow-sm border border-orange-100">
           <div className="flex gap-2 mb-3">
              <span className={`text-[10px] px-2 py-1 rounded-lg font-black ${isClosed ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-600'}`}>
                {isClosed ? '마감됨' : '진행중'}
              </span>
              {roomData.tags.map((tag, i) => (
                <span key={i} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-lg font-bold">#{tag}</span>
              ))}
           </div>
           <h1 className="text-xl font-black text-gray-800 mb-4 leading-snug">{roomData.title}</h1>
           <div className="bg-orange-50 p-4 rounded-2xl text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
             {roomData.content}
           </div>
        </div>

        {/* 탭 버튼 */}
        <div className="mx-4 mb-4 bg-gray-200 p-1 rounded-2xl flex relative z-10">
          {mode !== 'discuss' && (
            <button onClick={() => setActiveTab('vote')} className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === 'vote' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              📊 투표 {isVoted ? '결과' : '하기'}
            </button>
          )}
          {mode !== 'choice' && (
            <button onClick={() => { if(roomData.questions?.length > 0 && !isVoted) return; setActiveTab('discuss'); }} 
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all relative ${activeTab === 'discuss' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              🗣️ 와글와글 댓글
              {isVoted && activeTab !== 'discuss' && !isClosed && (
                  <span className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full animate-bounce">
                  </span>
              )}
            </button>
          )}
        </div>

        <div className="px-4 pb-20">
          {/* 투표 탭 */}
          {activeTab === 'vote' && mode !== 'discuss' && (
            <div className="animate-fade-in space-y-3">
               {!isVoted ? (
                   // --- [투표 진행 화면] Step-by-Step ---
                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                       {/* 진행 바 */}
                       <div className="mb-6">
                         <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                           <span>문제 {currentQIdx + 1}</span>
                           <span>{questions.length}개 중</span>
                         </div>
                         <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-orange-400 transition-all duration-300 ease-out"
                             style={{ width: `${((currentQIdx + 1) / questions.length) * 100}%` }}
                           ></div>
                         </div>
                       </div>

                       {/* 질문 영역 */}
                       <div className="min-h-[200px] flex flex-col justify-center">
                          <h4 className="font-black text-xl text-gray-800 mb-6 text-center leading-snug">
                            Q{currentQIdx + 1}. <br/>
                            <span className="text-orange-600">{questions[currentQIdx].text}</span>
                          </h4>
                          
                          <div className="space-y-3">
                             {questions[currentQIdx].options.map((opt, optIdx) => (
                               <button 
                                  key={optIdx} 
                                  onClick={() => handleVoteChange(questions[currentQIdx].id, opt)}
                                  disabled={isClosed}
                                  className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all shadow-sm font-bold text-base flex justify-between items-center ${myVotes[questions[currentQIdx].id] === opt ? 'bg-orange-50 border-orange-400 text-orange-700 scale-[1.02]' : 'bg-white border-gray-100 text-gray-600 hover:bg-orange-50 hover:border-orange-200'}`}
                               >
                                  {opt}
                                  {myVotes[questions[currentQIdx].id] === opt && <Check className="w-5 h-5 text-orange-500" />}
                               </button>
                             ))}
                          </div>
                       </div>

                       {/* 네비게이션 버튼 (이전, 완료만 남김) */}
                       <div className="flex justify-between items-center mt-8">
                         {currentQIdx > 0 ? (
                           <button onClick={goToPrevQuestion} className="px-4 py-3 rounded-2xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition-colors">
                             <ChevronLeft className="w-5 h-5" />
                           </button>
                         ) : <div></div> /* Spacer */}
                         
                         {/* 마지막 문제일 때만 완료 버튼 표시 (중간 단계는 자동 이동) */}
                         {currentQIdx === questions.length - 1 && (
                           <button 
                             onClick={submitVote} 
                             disabled={!myVotes[questions[currentQIdx].id]}
                             className={`flex-1 ml-3 py-3 rounded-2xl font-black text-lg transition-all shadow-md ${myVotes[questions[currentQIdx].id] ? 'bg-black text-white hover:bg-gray-800 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                           >
                             결과 보기 🎉
                           </button>
                         )}
                       </div>
                   </div>
               ) : (
                   // --- [투표 결과 화면] 모든 결과 표시 ---
                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                       <div className="text-center mb-6">
                           <div className="text-4xl mb-2">🎉</div>
                           <h4 className="font-black text-xl text-gray-800">모두 참여 완료!</h4>
                           <p className="text-xs text-gray-400">다른 친구들은 뭘 선택했을까?</p>
                       </div>
                       
                       <div className="space-y-8">
                           {questions.map((q, idx) => (
                             <div key={q.id} className="relative">
                               <div className="flex items-center gap-2 mb-3">
                                 <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md">Q{idx+1}</span>
                                 <h5 className="font-bold text-gray-800 text-sm">{q.text}</h5>
                               </div>
                               
                               <div className="space-y-2 pl-1">
                                 {q.options.map((opt) => {
                                   const count = voteStats[opt] || 0;
                                   const total = q.options.reduce((acc, curr) => acc + (voteStats[curr] || 0), 0);
                                   const percent = Math.round((count / total) * 100) || 0;
                                   const isMyPick = myVotes[q.id] === opt;
                                   
                                   return (
                                     <div key={opt} className="relative">
                                       {/* 막대 그래프 배경 */}
                                       <div className={`h-10 rounded-xl flex items-center px-3 relative overflow-hidden border ${isMyPick ? 'border-orange-200 bg-orange-50' : 'border-gray-100 bg-gray-50'}`}>
                                          <div 
                                            className={`absolute left-0 top-0 bottom-0 opacity-20 transition-all duration-1000 ease-out ${isMyPick ? 'bg-orange-500' : 'bg-gray-400'}`}
                                            style={{ width: `${percent}%` }}
                                          ></div>
                                          
                                          <div className="relative z-10 flex justify-between w-full items-center">
                                            <span className={`text-xs font-bold ${isMyPick ? 'text-orange-700' : 'text-gray-600'}`}>
                                              {opt} {isMyPick && <span className="text-[9px] bg-orange-500 text-white px-1.5 py-0.5 rounded ml-1">나</span>}
                                            </span>
                                            <span className="text-xs font-bold text-gray-500">{percent}%</span>
                                          </div>
                                       </div>
                                     </div>
                                   )
                                 })}
                               </div>
                               {/* 구분선 */}
                               {idx < questions.length - 1 && <div className="h-px bg-gray-100 mt-6 mx-2"></div>}
                             </div>
                           ))}
                       </div>

                       {mode !== 'choice' && (
                           <button onClick={() => setActiveTab('discuss')} className="w-full mt-8 py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-md hover:bg-orange-600 flex items-center justify-center gap-2 transition-transform active:scale-95">
                               <MessageCircle className="w-5 h-5" /> <span>친구들 반응 보러가기</span>
                           </button>
                       )}
                   </div>
               )}
            </div>
          )}

          {/* 토론 탭 */}
          {activeTab === 'discuss' && mode !== 'choice' && (
            <div className="animate-fade-in flex flex-col">
                {/* 잠금 화면 (투표 안했을 때) */}
                {roomData.questions?.length > 0 && !isVoted && !isClosed && (
                     <div className="bg-white/80 backdrop-blur rounded-3xl p-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300">
                        <Lock className="w-10 h-10 text-gray-300 mb-3" />
                        <h4 className="font-black text-gray-600 text-lg">아직 잠겨있어!</h4>
                        <p className="text-sm text-gray-400 mt-1 mb-4">투표를 해야 친구들 글을 볼 수 있어 🤫</p>
                        <button onClick={() => setActiveTab('vote')} className="px-6 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold shadow-md active:scale-95 transition-transform">투표하러 가기</button>
                    </div>
                )}

                {(isVoted || mode === 'discuss' || isClosed) && (
                  <>
                    {/* 필터 4종 */}
                    <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar py-1">
                        {roomData.questions?.length > 0 && (
                          <button onClick={() => setFilterMode('same_opinion')} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs border-2 flex items-center gap-1 transition-colors ${filterMode === 'same_opinion' ? 'bg-pink-100 border-pink-200 text-pink-600 font-bold' : 'bg-white border-gray-100 text-gray-400 font-medium'}`}>
                            <Zap className="w-3 h-3" /> 통하는 친구
                          </button>
                        )}
                        <button onClick={() => setFilterMode('popular')} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs border-2 transition-colors ${filterMode === 'popular' ? 'bg-red-100 border-red-200 text-red-600 font-bold' : 'bg-white border-gray-100 text-gray-400 font-medium'}`}>
                          🔥 인기순
                        </button>
                        <button onClick={() => setFilterMode('my_comments')} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs border-2 transition-colors ${filterMode === 'my_comments' ? 'bg-yellow-100 border-yellow-200 text-yellow-600 font-bold' : 'bg-white border-gray-100 text-gray-400 font-medium'}`}>
                          💬 내가 쓴 글
                        </button>
                        <button onClick={() => setFilterMode('newest')} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs border-2 transition-colors ${filterMode === 'newest' ? 'bg-blue-100 border-blue-200 text-blue-600 font-bold' : 'bg-white border-gray-100 text-gray-400 font-medium'}`}>
                          최신순
                        </button>
                    </div>
                    
                    {/* 댓글 입력창 */}
                    <div className={`bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-4 ${isClosed ? 'opacity-60 grayscale' : ''}`}>
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-xs font-bold text-gray-600">나 (익명)</span>
                        </div>
                        <textarea 
                          value={commentInput} 
                          onChange={(e) => setCommentInput(e.target.value)} 
                          rows="2" 
                          placeholder={isClosed ? "댓글을 남길 수 없어." : "친구들에게 예쁜 말을 남겨줘!"}
                          disabled={isClosed}
                          className="w-full text-sm border-none focus:ring-0 resize-none p-0 outline-none placeholder-gray-300"
                        ></textarea>
                        <div className="flex justify-end mt-2">
                            <button 
                              onClick={handleCommentSubmit} 
                              disabled={isClosed}
                              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${isClosed ? 'bg-gray-100 text-gray-400' : 'bg-orange-500 text-white shadow-md active:scale-95'}`}
                            >
                              등록
                            </button>
                        </div>
                    </div>

                    {/* 댓글 리스트 */}
                    <div className="space-y-3">
                        {getFilteredComments().length === 0 ? (
                           <div className="text-center py-10 text-gray-300 text-xs">아직 글이 없어! 첫 번째 주인공이 되어줘 😎</div>
                        ) : (
                          getFilteredComments().map(c => {
                             // 다중 투표일 경우 일치도 계산하여 태그 표시
                             const score = isMultiChoice && isVoted ? calculateMatchScore(c.voteProfile) : 0;
                             const matchTag = isMultiChoice && isVoted ? getMatchTag(score) : null;
                             
                             // 단일 투표일 경우 단순 일치 여부
                             const isSingleMatch = !isMultiChoice && myVotes['q1'] && c.vote === myVotes['q1'];

                             return (
                                <div key={c.id} className={`p-4 rounded-3xl shadow-sm border-2 ${c.isMe ? 'bg-white border-blue-100' : 'bg-white border-transparent'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`font-bold text-xs ${c.colorClass}`}>{c.name}</span>
                                        <span className="text-[10px] text-gray-300">{c.timeStr}</span>
                                        
                                        {/* 태그 표시 영역 */}
                                        {isMultiChoice && matchTag && (
                                           <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ml-auto ${matchTag.color}`}>{matchTag.text}</span>
                                        )}
                                        {isSingleMatch && (
                                           <span className="text-[9px] px-2 py-0.5 rounded-full bg-pink-100 text-pink-500 font-bold ml-auto">⚡️ 찌찌뽕!</span>
                                        )}
                                    </div>
                                    <div className="">
                                        <p className="text-sm text-gray-600 font-medium leading-relaxed">{c.content}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                          {!isMultiChoice && c.vote && <span className="text-[10px] bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded border border-gray-100">{c.vote}</span>}
                                          <button className="flex items-center gap-1 text-gray-300 text-xs ml-auto hover:text-red-400 transition-colors"><ThumbsUp className="w-3 h-3" /> {c.likes}</button>
                                        </div>
                                    </div>
                                </div>
                             );
                          })
                        )}
                    </div>
                  </>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- [메인 App] ---
export default function App() {
  const [currentView, setCurrentView] = useState('list'); 
  const [selectedRoom, setSelectedRoom] = useState(null);

  const renderView = () => {
    switch(currentView) {
      case 'list':
        return (
          <RoomList 
            onSelectRoom={(room) => {
              setSelectedRoom(room);
              setCurrentView('room');
            }}
            onGoToSuggest={() => setCurrentView('suggest')}
          />
        );
      case 'room':
        return (
          <DiscussionRoom 
            roomData={selectedRoom} 
            onBack={() => {
              setSelectedRoom(null);
              setCurrentView('list');
            }} 
          />
        );
      case 'suggest':
        return (
          <SuggestTopic 
            onBack={() => setCurrentView('list')}
          />
        );
      default:
        return <div>Error</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] text-gray-800 font-sans flex justify-center">
      {renderView()}
    </div>
  );
}