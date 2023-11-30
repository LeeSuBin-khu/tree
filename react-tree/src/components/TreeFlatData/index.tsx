import React, { useState } from "react";

import { FlatDataType } from "../../@Types";

import './index.scss';

interface ITreeWithFlatDataProps {
  /** 전체 데이터 배열 */
  items: FlatDataType[];
  /** 데이터 배열 변화 함수 */
  onChangeItems: (items: FlatDataType[]) => void;
}

const TreeFlatData = ({ items, onChangeItems }: ITreeWithFlatDataProps) => {
  const [curItem, setCurItem] = useState<FlatDataType>(); // 드래그되는 아이템(from)
  const [expanded, setExpanded] = useState<number[]>([]); // 확장된 아이템

    /** 1. 자식 요소 구하는 함수 */
    const getChildItems = (item: FlatDataType, list: FlatDataType[]) => {
        items.forEach(data => {
          if (data.parentId === item.id) {
            list.push(data);
            getChildItems(data, list);
          }
        });
    
        return list;
      };
    
      /** 2. 드래그 시작시 이벤트 */
      const onDragStart = (item: FlatDataType) => (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        setCurItem(item);
      };
    
      /** 3. 드롭 이벤트 */
      const onDrop = (item: FlatDataType, type: 'position' | 'depth', orientation?: 'up' | 'down') => (e: React.DragEvent) => {
        onDragEvent(e);
    
        e.currentTarget.classList.remove('active');
    
        /** 아이템이 선택되지 않았을 때, */
        if (!curItem) return;
    
        /** 자기자신에게 드롭한 경우, */
        if (curItem === item) return;
    
        const newList: FlatDataType[] = [];
        const curItemList = getChildItems(curItem, []);
    
        // 1) 드래그되는 아이템 삭제
        const removed = items.filter((data) => !curItemList.includes(data)).filter(data => data.id !== curItem.id);
    
        if (type === 'position') {
          /** 위치 변경의 경우, */
    
          const idx = removed.indexOf(item);
    
          // 2) 자식 아이템들의 depth 변경
          const newCurItemList = curItemList.map(data => {
            return { ...data, id: data.id, depth: data.depth - curItem.depth + item.depth, parentId: data.parentId };
          });
    
          // 3) 현재 아이템의 depth 변경
          newCurItemList.unshift({ ...curItem, id: curItem.id, depth: item.depth, parentId: item.parentId });
    
          if (orientation === 'up') {
            /** 위에 드롭하는 경우, */
    
            // 4) 리스트 해당 인덱스에 추가
            newList.push(...removed.slice(0, idx), ...newCurItemList, ...removed.slice(idx));
          } else {
            /** 아래에 드롭하는 경우, */
    
            // 4) 드롭되는 아이템의 자식 요소 수 구하기
            const childNum = getChildItems(item, []).length;
    
            // 5) 리스트 해당 인덱스 + 자식 요소 수에 추가
            newList.push(...removed.slice(0, idx + childNum + 1), ...newCurItemList, ...removed.slice(idx + childNum + 1));
          }
        } else {
          /** 소속 변경의 경우, */
    
          // 자신의 부모에 다시 소속 시키는 경우,
          if (curItemList.includes(item)) return;
    
          const idx = removed.indexOf(item);
    
          // 2) 자식 아이템들의 depth 변경
          const newCurItemList = curItemList.map(data => {
            return { ...data, id: data.id, depth: data.depth - curItem.depth + item.depth + 1, parentId: data.parentId };
          });
    
          // 3) 현재 아이템의 depth 변경
          newCurItemList.unshift({ ...curItem, id: curItem.id, depth: item.depth + 1, parentId: item.id });
          
          // 4) 리스트 해당 인덱스에 추가
          newList.push(...removed.slice(0, idx + 1), ...newCurItemList, ...removed.slice(idx + 1));
    
          setExpanded(prev => [...prev, item.id]);
        }
    
        onChangeItems(newList);
      };
    
      /** 4. 클릭 이벤트 */
      const onClick = (item: FlatDataType) => {
        if (item.type === 'single') return;
    
        if (!getChildItems(item, []).length) return;
    
        const curItemList = getChildItems(item, []);
    
        if (expanded.includes(item.id)) {
          setExpanded(expanded.filter(id => id !== item.id && !curItemList.map(data => data.id).includes(id)));
        } else {
          setExpanded(prev => [...prev, item.id]);
        }
      };
    
      /** 5. 드래그 공통 로직 */
      const onDragEvent = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
      };
    
      /** 6. 가장 최대 depth 구하는 함수 */
      const searchMaxDepth = (items: FlatDataType[]) => {
        let max = 0;
        items.forEach(data => {
          if (data.depth > max) max = data.depth;
        });
        
        return max;
      };
    
      /** 7. 드래그 위에 있을 때, 이벤트 */
      const onDragOver = (e: React.DragEvent) => {
        onDragEvent(e);    
    
        e.currentTarget.classList.add('active');
      };
    
      /** 8. 드래그 벗어났을 때, 이벤트 */
      const onDragLeave = (e: React.DragEvent) => {
        onDragEvent(e);
    
        e.currentTarget.classList.remove('active');
      };

  return (
    <div className="tree">
        {items.map((item, idx) =>
        <div
          key={idx}
          className={`tree-advanced 
          depth-${item.depth} 
          ${item.depth > 1 && 'hidden'} 
          ${expanded.includes(item.parentId) && 'visible'} 
          `}
          onDragStart={() => onDragStart(item)}
          onDrop={onDrop(item, 'depth')}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDragEnter={onDragEvent}
          onClick={() => onClick(item)}
          draggable
        >
          {/** 처음 오는 아이템의 경우, 위로 이동시킬 수 있는 노드 */}
          {items[idx - 1]?.parentId !== item.parentId && (
            <div 
              className="position up" 
              onDrop={onDrop(item, 'position', 'up')} 
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
            />
          )}
          <div className={`item depth-${item.depth} ${getChildItems(item, []).length === 0 && 'inactive'}`}>
            {item.id}
          </div>
          {!expanded.includes(item.id) && (
            <div 
              className="position" 
              onDrop={onDrop(item, 'position')} 
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default TreeFlatData;