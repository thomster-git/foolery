import json

def process_batch(batch_path, output_path):
    with open(batch_path, 'r') as f:
        batch = json.load(f)
        
    output = []
    
    # Defaults for the empty ones
    default_themes = {
        "hyper-v": ["systems-thinking", "learning"],
        "vmware-esxi": ["systems-thinking", "learning"],
        "xcp-ng": ["systems-thinking", "learning"],
        "xtool-s1": ["craftsmanship"]
    }
    
    default_topics = {
        "hyper-v": ["virtualization", "infrastructure"],
        "vmware-esxi": ["virtualization", "infrastructure"],
        "xcp-ng": ["virtualization", "infrastructure"],
        "xtool-s1": ["design", "engineering"]
    }
    
    default_related = {
        "hyper-v": ["proxmox-ve"],
        "vmware-esxi": ["proxmox-ve"],
        "xcp-ng": ["proxmox-ve"],
        "xtool-s1": ["xtool-s1-40w-diode-laser", "etchcentric-creations"]
    }
    
    for item in batch:
        missing = item.get("missing", [])
        
        obj = {
            "id": item["id"],
            "path": item["path"]
        }
        
        # Use existing ones if present, else fallback to defaults, else empty array
        themes = item.get("currentThemes", [])
        if not themes:
            themes = default_themes.get(item["id"], ["systems-thinking"])
            
        topics = item.get("currentTopics", [])
        if not topics:
            topics = default_topics.get(item["id"], ["technology"])
            
        tags = item.get("currentTags", [])
        if not tags:
            tags = ["software"]
            
        related = item.get("currentRelated", [])
        if not related:
            related = default_related.get(item["id"], [])
            
        if "themes" in missing:
            obj["themes"] = themes
        if "topics" in missing:
            obj["topics"] = topics
        if "tags" in missing:
            obj["tags"] = tags
        if "related" in missing:
            obj["related"] = related
            
        output.append(obj)
        
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=2)

process_batch('/home/keel/Project-Atlas-main/batch3.json', '/home/keel/Project-Atlas-main/output3.json')
