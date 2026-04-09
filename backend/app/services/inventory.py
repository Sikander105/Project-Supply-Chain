from copy import deepcopy


from app.data.mock_data import MOCK_DATA


_STORE = deepcopy(MOCK_DATA)

_PREFIXES = {
    "products": "PRD",
    "vendors": "VND",
    "warehouses": "WH",
    "purchaseOrders": "PO",
    "shipments": "SHP",
}



def _ensure_entity(entity: str) -> None:
    if entity not in _STORE:
        raise KeyError(f"Unknown entity: {entity}")


def _next_id(entity: str) -> str:
    prefix = _PREFIXES[entity]
    max_number = 1000

    for item in _STORE[entity]:
        raw_value = str(item.get("id", "")).replace(f"{prefix}-", "")
        if raw_value.isdigit():
            max_number = max(max_number, int(raw_value))

    return f"{prefix}-{max_number + 1}"



def list_items(entity: str):
    _ensure_entity(entity)
    return deepcopy(_STORE[entity])


def get_item(entity: str, item_id: str):
    _ensure_entity(entity)

    for item in _STORE[entity]:
        if item.get("id") == item_id:
            return deepcopy(item)

    return None


def create_item(entity: str, payload: dict):
    _ensure_entity(entity)

    item = {
        **payload,
        "id": payload.get("id") or _next_id(entity),
    }

    _STORE[entity].insert(0, item)
    return deepcopy(item)


def update_item(entity: str, item_id: str, payload: dict):
    _ensure_entity(entity)

    for index, item in enumerate(_STORE[entity]):
        if item.get("id") != item_id:
            continue

        updated_item = {
            **item,
            **payload,
            "id": item_id,
        }

        _STORE[entity][index] = updated_item
        return deepcopy(updated_item)

    return None


def delete_item(entity: str, item_id: str) -> bool:
    _ensure_entity(entity)

    for index, item in enumerate(_STORE[entity]):
        if item.get("id") == item_id:
            _STORE[entity].pop(index)
            return True

    return False


def get_store_snapshot():
    
    return deepcopy(_STORE)