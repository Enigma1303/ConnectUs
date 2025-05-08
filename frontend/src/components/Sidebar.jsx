import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search, X, UserPlus, Filter } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, conversations } = useChatStore();
  const { onlineUsers, currentUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);

  // Get unique user IDs that the current user has chatted with
  const chatPartnerIds = conversations
    ? [...new Set(conversations.map(conv => 
        conv.participants.find(id => id !== currentUser?._id)
      ).filter(Boolean))]
    : [];

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    if (!users) return;
    
    // First filter by chat history unless showAllUsers is true
    let filteredUsers = showAllUsers 
      ? users 
      : users.filter(user => chatPartnerIds.includes(user._id));
    
    // Then apply search and online filters
    if (searchQuery.trim() === "") {
      // If search is empty, only filter by online status if needed
      filteredUsers = showOnlineOnly
        ? filteredUsers.filter((user) => onlineUsers.includes(user._id))
        : filteredUsers;
    } else {
      // Filter by search query (and possibly online status)
      filteredUsers = filteredUsers.filter((user) => {
        const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase());
        if (showOnlineOnly) {
          return matchesSearch && onlineUsers.includes(user._id);
        }
        return matchesSearch;
      });
    }
    
    setSearchResults(filteredUsers);
  }, [searchQuery, users, showOnlineOnly, onlineUsers, chatPartnerIds, showAllUsers]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  const onlineUserCount = onlineUsers.length - 1;

  return (
    <aside className="h-full w-20 lg:w-80 border-r border-base-300 flex flex-col transition-all duration-200 bg-base-100 shadow-sm">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Users className="size-5 text-primary" />
            </div>
            <span className="font-semibold text-lg hidden lg:block">Contacts</span>
          </div>
          <button className="p-2 rounded-full hover:bg-base-200 transition-colors hidden lg:flex" title="Add new contact">
            <UserPlus className="size-5 text-primary" />
          </button>
        </div>
        
        {/* Search bar */}
        <div className="mt-3 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 pl-10 pr-10 rounded-lg bg-base-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all border border-transparent focus:border-primary/30"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="size-4 text-zinc-400 hover:text-zinc-600" />
              </button>
            )}
          </div>
        </div>
        
        {/* Filter section */}
        <div className="mt-4 hidden lg:block">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md hover:bg-base-200 transition-colors"
              >
                <Filter className="size-3.5 text-zinc-500" />
                <span>Filters</span>
              </button>
              
              {onlineUserCount > 0 && (
                <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                  {onlineUserCount} online
                </span>
              )}
            </div>
          </div>
          
          {showFilterMenu && (
            <div className="mt-2 p-3 bg-base-200 rounded-lg shadow-sm space-y-2">
              <label className="cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showOnlineOnly}
                  onChange={(e) => setShowOnlineOnly(e.target.checked)}
                  className="checkbox checkbox-sm checkbox-primary"
                />
                <span className="text-sm">Show online users only</span>
              </label>
              
              <label className="cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showAllUsers}
                  onChange={(e) => setShowAllUsers(e.target.checked)}
                  className="checkbox checkbox-sm checkbox-primary"
                />
                <span className="text-sm">Show all registered users</span>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-y-auto w-full py-2 flex-1 scrollbar-thin">
        {searchResults.length > 0 ? (
          <div className="flex flex-col gap-1 px-2">
            {searchResults.map((user) => {
              const hasChatHistory = chatPartnerIds.includes(user._id);
              
              return (
                <button
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`
                    w-full p-2.5 flex items-center gap-3
                    hover:bg-base-200 transition-colors rounded-lg
                    ${selectedUser?._id === user._id ? "bg-primary/10 ring-1 ring-primary/20" : ""}
                  `}
                >
                  <div className="relative mx-auto lg:mx-0">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className={`size-12 object-cover rounded-full border-2 ${hasChatHistory ? "border-primary/20" : "border-base-200"}`}
                    />
                    {onlineUsers.includes(user._id) && (
                      <span
                        className="absolute bottom-0 right-0 size-3.5 bg-green-500 
                        rounded-full ring-2 ring-base-100"
                      />
                    )}
                  </div>

                  {/* User info - only visible on larger screens */}
                  <div className="hidden lg:block text-left min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium truncate">{user.fullName}</span>
                      {!hasChatHistory && (
                        <span className="text-xs px-1.5 py-0.5 bg-base-200 text-zinc-500 rounded-full">New</span>
                      )}
                    </div>
                    <div className="text-sm text-zinc-400 flex items-center gap-1.5">
                      <span className={`size-1.5 rounded-full ${onlineUsers.includes(user._id) ? "bg-green-500" : "bg-zinc-400"}`}></span>
                      {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-zinc-500 py-8 flex flex-col items-center gap-2">
            <Search className="size-5 text-zinc-400" />
            <p>
              {searchQuery 
                ? "No users found" 
                : showOnlineOnly 
                  ? "No online users" 
                  : showAllUsers 
                    ? "No users available" 
                    : "No chat history found"}
            </p>
            {!showAllUsers && !searchQuery && (
              <button 
                onClick={() => setShowAllUsers(true)}
                className="mt-2 text-sm text-primary hover:underline"
              >
                View all available users
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Mobile filter toggle */}
      <div className="lg:hidden border-t border-base-300 p-3 flex justify-center gap-3">
        <button 
          onClick={() => setShowOnlineOnly(!showOnlineOnly)}
          className={`p-2 rounded-full ${showOnlineOnly ? "bg-primary text-white" : "bg-base-200"}`}
          title={showOnlineOnly ? "Showing online only" : "Show all online status"}
        >
          <Filter className="size-5" />
        </button>
        
        <button 
          onClick={() => setShowAllUsers(!showAllUsers)}
          className={`p-2 rounded-full ${showAllUsers ? "bg-primary text-white" : "bg-base-200"}`}
          title={showAllUsers ? "Showing all users" : "Showing chat history only"}
        >
          <Users className="size-5" />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;