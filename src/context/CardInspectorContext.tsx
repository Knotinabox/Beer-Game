import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  RecipeCard,
  UpgradeCard,
  IngredientCard,
  MixerPackCard,
  PlayerState,
  ZoneId,
} from '../engine/types';

export type InspectableCard =
  | {
      type: 'recipe';
      card: RecipeCard;
      activePlayer?: PlayerState;
      canBrew?: boolean;
      onBrew?: () => void;
      brewDisabledReason?: string;
    }
  | {
      type: 'upgrade';
      card: UpgradeCard;
      activePlayer?: PlayerState;
      canInvest?: boolean;
      onInvest?: (option?: 'equipment' | 'staff' | 'leftWing' | 'rightWing') => void;
      investDisabledReason?: string;
      targetZone?: ZoneId;
      tuckEdge?: 'top' | 'bottom' | 'left' | 'right';
    }
  | {
      type: 'ingredient';
      card: IngredientCard;
      selected?: boolean;
      onSelect?: () => void;
    }
  | {
      type: 'mixer';
      card: MixerPackCard;
      completedRecipeNames?: string[];
      activePlayer?: PlayerState;
    };

interface CardInspectorContextType {
  inspectedCard: InspectableCard | null;
  inspectCard: (card: InspectableCard | null) => void;
  hoveredCard: InspectableCard | null;
  hoverAnchorRect: DOMRect | null;
  setHoveredCard: (card: InspectableCard | null, anchorRect?: DOMRect | null) => void;
  hoverZoomEnabled: boolean;
  setHoverZoomEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const CardInspectorContext = createContext<CardInspectorContextType | undefined>(undefined);

export const CardInspectorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inspectedCard, setInspectedCard] = useState<InspectableCard | null>(null);
  const [hoveredCard, setHoveredCardState] = useState<InspectableCard | null>(null);
  const [hoverAnchorRect, setHoverAnchorRect] = useState<DOMRect | null>(null);
  const [hoverZoomEnabled, setHoverZoomEnabled] = useState<boolean>(false);

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inspectCard = useCallback((card: InspectableCard | null) => {
    // If opening modal, clear any active hover
    if (card) {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      setHoveredCardState(null);
      setHoverAnchorRect(null);
    }
    setInspectedCard(card);
  }, []);

  const setHoveredCard = useCallback(
    (card: InspectableCard | null, anchorRect?: DOMRect | null) => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }

      if (!card) {
        // Fast exit when cursor leaves
        setHoveredCardState(null);
        setHoverAnchorRect(null);
        return;
      }

      // Small 140ms debounce to prevent annoying popups while quickly scrolling or mousing across
      hoverTimerRef.current = setTimeout(() => {
        setHoveredCardState(card);
        setHoverAnchorRect(anchorRect || null);
      }, 140);
    },
    []
  );

  return (
    <CardInspectorContext.Provider
      value={{
        inspectedCard,
        inspectCard,
        hoveredCard,
        hoverAnchorRect,
        setHoveredCard,
        hoverZoomEnabled,
        setHoverZoomEnabled,
      }}
    >
      {children}
    </CardInspectorContext.Provider>
  );
};

export function useCardInspector() {
  const context = useContext(CardInspectorContext);
  if (!context) {
    return {
      inspectedCard: null,
      inspectCard: () => {},
      hoveredCard: null,
      hoverAnchorRect: null,
      setHoveredCard: () => {},
      hoverZoomEnabled: false,
      setHoverZoomEnabled: () => {},
    };
  }
  return context;
}
