import { useState, useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { 
  MessageCircle, ThumbsUp, Lock, CheckCircle2, Zap, Settings, 
  ArrowLeft, Users, Search, Bell, Clock, Calendar, Filter, Star, AlertTriangle
} from 'lucide-react';

// Chart.js 등록
ChartJS.register(ArcElement, Tooltip, Legend);

// --- [유틸리티] 랜덤 닉네임 생성기 ---
const getRandomProfile = () => {
  const animals = ['🐶 강아지', '🐱 고양이', '🐹 햄스터', '🐰 토끼', '🦊 여우', '🐼 판다', '🐯 호랑이'];
  const adjs = ['신난', '배고픈', '졸린', '용감한', '똑똑한', '행복한'];
  return {
    name: `${adjs[Math.floor(Math.random() * adjs.length)]} ${animals[Math.floor(Math.random() * animals.length)]}`,
    color: ['bg-red-100', 'bg-orange-100', 'bg-yellow-100', 'bg-green-100', 'bg-blue-100', 'bg-purple-100'][Math.floor(Math.random() * 6)]
  };
};

// --- [컴포넌트 1] 메인 방 리스트 화면 ---
const RoomList = ({ onSelectRoom }) => {
  const [showClosed, setShowClosed] = useState(false); 
  const [activeFilters, setActiveFilters] = useState([]); 

  const rooms = [
    { 
      id: 101, 
      title: '🍱 10월 급식 메뉴 월드컵', 
      content: '친구들! 10월 특식으로 뭐가 나오면 좋을까?\n가장 먹고 싶은 메뉴를 골라줘!',
      type: 'choice_discuss', 
      tags: ['HOT', '급식'], 
      participants: 128, 
      comments: 45, 
      status: 'OPEN', 
      hasParticipated: true,
      bg: 'bg-orange-100',
      icon: '🍛',
      endDate: '10.25'
    },
    { 
      id: 102, 
      title: '👕 체육대회 반티 정하기', 
      content: '축구복은 너무 흔한가? 잠옷은 어때?\n우리 반의 멋진 반티를 골라줘!',
      type: 'choice', 
      tags: ['3학년', '체육대회'], 
      participants: 340, 
      comments: 0, 
      status: 'OPEN', 
      hasParticipated: false,
      bg: 'bg-blue-100',
      icon: '⚽️',
      endDate: '10.30'
    },
    { 
      id: 103, 
      title: '📐 수학 시험 어땠어?', 
      content: '서술형 마지막 문제 진짜 어렵지 않았어?\n다들 어떻게 풀었는지 이야기해보자 ㅠㅠ',
      type: 'discuss', 
      tags: ['멘붕', '시험'], 
      participants: 82, 
      comments: 156, 
      status: 'OPEN', 
      hasParticipated: true, 
      bg: 'bg-purple-100',
      icon: '✏️',
      endDate: '상시'
    },
    { 
      id: 104, 
      title: '📚 [종료] 9월 모의고사 후기', 
      content: '다들 시험 보느라 고생했어!',
      type: 'discuss', 
      tags: ['지난이야기'], 
      participants: 56, 
      comments: 89, 
      status: 'CLOSED', 
      hasParticipated: true,
      bg: 'bg-gray-200',
      icon: '💯',
      endDate: '09.10'
    },
  ];

  const allTags = [...new Set(rooms.filter(r => r.status === 'OPEN').flatMap(r => r.tags))];

  const toggleFilter = (filterId) => {
    setActiveFilters(prev => 
      prev.includes(filterId) ? prev.filter(id => id !== filterId) : [...prev, filterId]
    );
  };

  const getFilteredRooms = () => {
    const baseList = rooms.filter(room => showClosed ? room.status === 'CLOSED' : room.status === 'OPEN');
    if (activeFilters.length === 0) return baseList;
    return baseList.filter(room => {
      return activeFilters.some(filterId => {
        if (filterId === 'PARTICIPATED') return room.hasParticipated;
        if (filterId === 'NOT_PARTICIPATED') return !room.hasParticipated;
        if (filterId.startsWith('TAG_')) return room.tags.includes(filterId.replace('TAG_', ''));
        return false;
      });
    });
  };

  const filteredList = getFilteredRooms();

  return (
    <div className="w-full max-w-md mx-auto bg-[#FFF9F0] h-full flex flex-col font-sans">
      {/* 귀여운 헤더 */}
      <div className="bg-white px-5 pt-6 pb-4 sticky top-0 z-10 rounded-b-3xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-xs text-orange-400 font-extrabold tracking-wider">우리들의 이야기</span>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-800 tracking-tight">{showClosed ? '보물상자 (지난글)' : '와글와글 광장'}</h1>
            </div>
          </div>
          <div className="flex gap-2">
             <button 
               onClick={() => setShowClosed(!showClosed)}
               className={`flex items-center justify-center w-10 h-10 rounded-full transition-transform active:scale-90 shadow-sm border ${showClosed ? 'bg-orange-400 text-white border-orange-400' : 'bg-white text-gray-400 border-gray-100'}`}
             >
               {showClosed ? <ArrowLeft className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
             </button>
          </div>
        </div>

        {/* 필터 영역 (알약 모양) */}
        {!showClosed && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <button onClick={() => toggleFilter('PARTICIPATED')} className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border-2 shadow-sm ${activeFilters.includes('PARTICIPATED') ? 'bg-orange-400 border-orange-400 text-white' : 'bg-white border-orange-100 text-gray-400 hover:bg-orange-50'}`}>
                 ✅ 참여한 방
              </button>
              <button onClick={() => toggleFilter('NOT_PARTICIPATED')} className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border-2 shadow-sm ${activeFilters.includes('NOT_PARTICIPATED') ? 'bg-orange-400 border-orange-400 text-white' : 'bg-white border-orange-100 text-gray-400 hover:bg-orange-50'}`}>
                 ✨ 새로운 방
              </button>
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

      {/* 리스트 영역 */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {filteredList.map(room => (
          <div 
            key={room.id} 
            onClick={() => onSelectRoom(room)}
            className={`rounded-3xl p-5 shadow-sm border-2 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden ${room.status === 'CLOSED' ? 'bg-gray-50 border-gray-200 grayscale opacity-80' : 'bg-white border-orange-100 hover:border-orange-300 hover:shadow-md'}`}
          >
            {/* 참여 뱃지 */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-1.5 flex-wrap">
                {room.hasParticipated ? (
                  <span className="text-[10px] px-2.5 py-1 rounded-full font-black bg-green-100 text-green-600 flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3 h-3" /> 참여함!
                  </span>
                ) : (
                  room.status === 'OPEN' && <span className="text-[10px] px-2.5 py-1 rounded-full font-black bg-red-100 text-red-500 shadow-sm">NEW 🔥</span>
                )}
                {room.status === 'CLOSED' && <span className="text-[10px] px-2.5 py-1 rounded-full font-black bg-gray-200 text-gray-500">마감</span>}
              </div>
              <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded-lg">{room.endDate} 까지</span>
            </div>

            <div className="flex gap-4 items-start">
              {/* 아이콘 영역 */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${room.bg}`}>
                {room.icon}
              </div>
              
              <div className="flex-1">
                <h3 className="font-black text-lg text-gray-800 leading-tight mb-1">{room.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-1 font-medium">{room.content}</p>
                
                {/* 하단 정보 */}
                <div className="flex items-center gap-3 mt-3">
                   <div className="flex -space-x-1.5">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className={`w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] ${['bg-red-200', 'bg-yellow-200', 'bg-blue-200'][i]}`}>
                          {['🐶', '🐱', '🐹'][i]}
                        </div>
                      ))}
                   </div>
                   <span className="text-xs text-gray-400 font-bold">+{room.participants}명 참여중</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="h-10"></div> {/* 하단 여백 */}
      </div>
    </div>
  );
};

// --- [컴포넌트 2] 상세 이야기방 화면 ---
const DiscussionRoom = ({ roomData, onBack }) => {
  const isClosed = roomData.status === 'CLOSED';
  const initialTab = roomData.type === 'discuss' ? 'discuss' : 'vote';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isVoted, setIsVoted] = useState(roomData.hasParticipated || isClosed); 
  const [myVote, setMyVote] = useState(roomData.hasParticipated ? '돈가스' : null); 
  const [filterMode, setFilterMode] = useState('newest'); 
  const [commentInput, setCommentInput] = useState('');
  
  const [votes, setVotes] = useState({ '돈가스': 52, '스파게티': 38, '비빔밥': 15 });
  
  // 랜덤 닉네임과 함께 댓글 데이터 생성
  const [comments, setComments] = useState([
    { id: 101, ...getRandomProfile(), isMe: false, timeStr: '15분 전', vote: '돈가스', content: '돈가스가 짱이지! 소스 많이 뿌려주세요 😋', likes: 12 },
    { id: 102, ...getRandomProfile(), isMe: false, timeStr: '10분 전', vote: '스파게티', content: '난 면이 좋아.. 후루룩', likes: 5 },
  ]);

  const mode = roomData.type; 
  const myProfile = useMemo(() => ({ name: '나 (익명)', color: 'bg-blue-50' }), []); // 내 프로필은 고정

  const handleVote = (value) => {
    if (isClosed) return;
    setMyVote(value);
    setVotes(prev => ({ ...prev, [value]: prev[value] + 1 }));
    setIsVoted(true);
  };

  const handleCommentSubmit = () => {
    if (isClosed) return;
    if (!commentInput.trim()) return alert("친구들에게 할 말을 적어줘!");
    const newComment = {
      id: Date.now(), ...myProfile, isMe: true, timeStr: '방금',
      timestamp: Date.now(), vote: myVote, content: commentInput, likes: 0
    };
    setComments(prev => [newComment, ...prev]);
    setCommentInput('');
  };

  const getFilteredComments = () => {
    let filtered = [...comments];
    const calculateMatch = (c) => (myVote && c.vote === myVote ? 100 : 0);
    if (mode === 'choice_discuss' && filterMode === 'same_opinion' && myVote) {
      filtered = filtered.filter(c => calculateMatch(c) >= 50);
    }
    if (mode === 'choice_discuss' && filterMode === 'same_opinion') {
        filtered.sort((a, b) => calculateMatch(b) - calculateMatch(a));
    }
    return filtered;
  };

  const chartData = {
    labels: ['돈가스', '스파게티', '비빔밥'],
    datasets: [{
      data: Object.values(votes),
      backgroundColor: ['#F59E0B', '#EF4444', '#10B981'],
      borderWidth: 0,
    }]
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#FFF9F0] h-full flex flex-col relative font-sans">
      {/* 헤더 */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-3 sticky top-0 z-30 shadow-sm rounded-b-3xl">
        <button onClick={onBack} className="p-2 hover:bg-orange-50 rounded-full transition-colors text-gray-600">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 text-center">
            <span className="text-sm font-black text-gray-800 tracking-tight">{roomData.title}</span>
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

        {/* 탭 버튼 (둥글게) */}
        <div className="mx-4 mb-4 bg-gray-200 p-1 rounded-2xl flex relative z-10">
          {mode !== 'discuss' && (
            <button onClick={() => setActiveTab('vote')} className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${activeTab === 'vote' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              📊 투표 결과
            </button>
          )}
          {mode !== 'choice' && (
            <button onClick={() => { if(mode==='choice_discuss' && !isVoted) return; setActiveTab('discuss'); }} 
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all relative ${activeTab === 'discuss' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              🗣️ 와글와글 댓글
              {mode === 'choice_discuss' && isVoted && activeTab !== 'discuss' && !isClosed && (
                  <span className="absolute top-2 right-4 w-2 h-2 bg-red-500 rounded-full animate-bounce"></span>
              )}
            </button>
          )}
        </div>

        <div className="px-4 pb-20">
          {/* 투표 탭 */}
          {activeTab === 'vote' && mode !== 'discuss' && (
            <div className="animate-fade-in space-y-3">
               {!isVoted ? (
                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                       <h4 className="font-bold text-lg mb-4 text-center">👇 하나만 골라줘! 👇</h4>
                       <div className="space-y-3">
                           {['돈가스', '스파게티', '비빔밥'].map((opt, idx) => (
                               <button 
                                  key={idx} 
                                  onClick={() => handleVote(opt)} 
                                  disabled={isClosed}
                                  className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all shadow-sm group font-bold text-gray-600 ${isClosed ? 'bg-gray-50 border-gray-100' : 'bg-white border-orange-100 hover:border-orange-400 hover:bg-orange-50'}`}
                               >
                                   {['🍛', '🍝', '🥗'][idx]} {opt}
                               </button>
                           ))}
                       </div>
                   </div>
               ) : (
                   <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
                       <div className="text-4xl mb-2">🎉</div>
                       <h4 className="font-black text-xl text-gray-800 mb-1">투표 완료!</h4>
                       <p className="text-xs text-gray-400 mb-6">참여해줘서 고마워!</p>
                       <div className="h-48 w-full flex justify-center mb-6"><Doughnut data={chartData} options={{ maintainAspectRatio: false }} /></div>
                       {mode === 'choice_discuss' && (
                           <button onClick={() => setActiveTab('discuss')} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-md hover:bg-orange-600 flex items-center justify-center gap-2 transition-transform active:scale-95">
                               <MessageCircle className="w-5 h-5" /> <span>친구들 생각 보러가기</span>
                           </button>
                       )}
                   </div>
               )}
            </div>
          )}

          {/* 토론 탭 */}
          {activeTab === 'discuss' && mode !== 'choice' && (
            <div className="animate-fade-in flex flex-col">
                {mode === 'choice_discuss' && !isVoted && !isClosed && (
                     <div className="bg-white/80 backdrop-blur rounded-3xl p-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300">
                        <Lock className="w-10 h-10 text-gray-300 mb-3" />
                        <h4 className="font-black text-gray-600 text-lg">아직 잠겨있어!</h4>
                        <p className="text-sm text-gray-400 mt-1 mb-4">투표를 해야 들어올 수 있어 🤫</p>
                        <button onClick={() => setActiveTab('vote')} className="px-6 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold shadow-md active:scale-95 transition-transform">투표하러 가기</button>
                    </div>
                )}

                {(isVoted || mode === 'discuss' || isClosed) && (
                  <>
                    {/* 필터 */}
                    <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                         {mode === 'choice_discuss' && (
                          <button onClick={() => setFilterMode('same_opinion')} className={`px-4 py-1.5 rounded-full text-xs border-2 flex items-center gap-1 transition-colors ${filterMode === 'same_opinion' ? 'bg-pink-100 border-pink-200 text-pink-600 font-bold' : 'bg-white border-gray-100 text-gray-400 font-medium'}`}><Zap className="w-3 h-3" /> 나랑 통하는 친구</button>
                        )}
                        <button onClick={() => setFilterMode('newest')} className={`px-4 py-1.5 rounded-full text-xs border-2 transition-colors ${filterMode === 'newest' ? 'bg-blue-100 border-blue-200 text-blue-600 font-bold' : 'bg-white border-gray-100 text-gray-400 font-medium'}`}>최신순</button>
                    </div>
                    
                    {/* 입력창 */}
                    <div className={`bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-4 ${isClosed ? 'opacity-60 grayscale' : ''}`}>
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">🙂</div>
                           <span className="text-xs font-bold text-gray-600">나 (익명)</span>
                           {mode === 'choice_discuss' && myVote && <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 rounded font-bold"> · {myVote}</span>}
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
                        {getFilteredComments().map(c => {
                             const isMatch = mode === 'choice_discuss' && myVote && c.vote === myVote;
                             return (
                                <div key={c.id} className={`p-4 rounded-3xl shadow-sm border-2 ${c.isMe ? 'bg-white border-blue-100' : 'bg-white border-transparent'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${c.color}`}>{c.name.split(' ')[1].substring(0,2)}</span>
                                        <span className="font-bold text-gray-700 text-xs">{c.name}</span>
                                        <span className="text-[10px] text-gray-300">{c.timeStr}</span>
                                        {isMatch && <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 text-pink-500 font-bold ml-auto">⚡️ 찌찌뽕!</span>}
                                    </div>
                                    <div className="pl-8">
                                        <p className="text-sm text-gray-600 font-medium leading-relaxed">{c.content}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                          {mode === 'choice_discuss' && c.vote && <span className="text-[10px] bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded border border-gray-100">{c.vote}</span>}
                                          <button className="flex items-center gap-1 text-gray-300 text-xs ml-auto hover:text-red-400 transition-colors"><ThumbsUp className="w-3 h-3" /> {c.likes}</button>
                                        </div>
                                    </div>
                                </div>
                             );
                        })}
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

  return (
    <div className="min-h-screen bg-[#FFF9F0] text-gray-800 font-sans flex justify-center">
      {currentView === 'list' ? (
        <RoomList onSelectRoom={(room) => {
          setSelectedRoom(room);
          setCurrentView('room');
        }} />
      ) : (
        <DiscussionRoom 
          roomData={selectedRoom} 
          onBack={() => {
            setSelectedRoom(null);
            setCurrentView('list');
          }} 
        />
      )}
    </div>
  );
}
